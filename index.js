#!/usr/bin/env node

const opts = require('minimist')(process.argv.slice(2));
const ora = require('ora');
const AWS = require('aws-sdk');
const context = {};

let spinner = null;


preparation(opts).then(getFunctionNames).then(updateFunctions).catch(err => {
    try {
        if (spinner !== null) {
            console.log(err);
            spinner.fail(err);
        } else {
            console.log(err);
        }
    } catch (e) {
        console.log(e);
        console.log(err);
    }
});


function preparation(opts) {
    return new Promise((resolve, reject) => {
        const methods = opts['_'];
        const stack = opts.stack;
        const region = opts.region;
        const env = opts.env;
        const remove = opts.remove;
        const debug = opts.debug;

        if (methods.length !== 1) {
            reject('Error! Please specify a method for lambda-cfn-env: save / remove');
        }

        const method = methods[0];

        if (method !== 'save' && method !== 'remove') {
            reject('Error! Please specify a method for lambda-cfn-env: save / remove');
        }

        context.opts = {
            method,
            stack,
            region,
            remove,
            debug
        };

        if (method === 'save') {
            if (!stack || !region || !env || !env.indexOf('=') < 0) {
                reject('Usage: lambda-cfn-env save --stack stack-name --region region --env Key=Value [--debug]');
            } else {
                let splitter = env.indexOf('=');
                context.opts.envKey = env.substring(0, splitter);
                context.opts.envValue = env.substring(splitter + 1);
            }
        }

        if (method === 'remove') {
            if (!stack || !region || !env || env.indexOf('=') > -1) {
                reject('Usage: lambda-cfn-env remove --stack stack-name --region region --env Key [--debug]');
            } else {
                context.opts.envKey = env;
            }
        }

        _debug('Using options: ', context.opts);
        resolve(context);
    });
}


function getFunctionNames(context) {
    return new Promise((resolve, reject) => {
        // find all functions from cloudformation template and get their physical resource id

        spinner = ora('Collecting function(s) to update...').start();

        try {
            const cf = new AWS.CloudFormation({ apiVersion: '2010-05-15', region: context.opts.region });
            cf.describeStackResources({
                StackName: context.opts.stack
            }).promise().then(res => {
                let resources = res.StackResources;
                let lambdaFunctions = resources.filter(val => {
                    return val.ResourceType === 'AWS::Lambda::Function';
                }).map(val => {
                    return val.PhysicalResourceId;
                });

                _debug('Found functions: ', lambdaFunctions);

                spinner.succeed(`Found ${lambdaFunctions.length} potential function(s) to update.`);
                context.functions = lambdaFunctions;
                resolve(context);
            }).catch(err => {
                _debug('Not able to find stack.', err);
                reject('Not able to find stack.');
            });
        } catch (e) {
            spinner.fail('Something failed when collecting function(s) to update.');
            reject('Error: ', e);
        }
    });
}


function updateFunctions(context) {
    return new Promise((resolve, reject) => {
        let functions = context.functions;
        _debug('Collected function names: ', functions);

        spinner = ora(`Updating function(s)...`).start();

        const lambda = new AWS.Lambda({ apiVersion: '2015-03-31', region: context.opts.region });
        let updates = [];

        for (let i = 0; i < functions.length; i++) {
            let functionName = functions[i];

            if (functionName) {
                _debug('Updating function...', functionName);

                let promise = lambda.getFunctionConfiguration({
                    FunctionName: functionName
                }).promise().then(res => {
                    let params = {
                        FunctionName: res.FunctionName,
                        Environment: res.Environment
                    };

                    if (context.opts.method === 'remove') {
                        delete params.Environment.Variables[context.opts.envKey];
                    } else {
                        params.Environment.Variables[context.opts.envKey] = context.opts.envValue;
                    }

                    return lambda.updateFunctionConfiguration(params).promise().then(func => {
                        return func.FunctionName;
                    });
                });
                updates.push(promise);
            } else {
                _debug('Ignoring function name, because it is undefined.');
            }
        }

        Promise.all(updates).then(updatedFunctions => {
            spinner.succeed(`Updated ${updatedFunctions.length} function(s):  ${updatedFunctions}`);
        }).catch(reject);
    });
}


///// === HELPER === /////

function _debug(message, object) {
    if (context.opts.debug) {
        console.log("[DEBUG] " + message, JSON.stringify(object));
    }
}