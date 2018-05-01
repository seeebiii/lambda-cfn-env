# lambda-cfn-env
A small CLI tool to update environment variables of one or more [AWS Lambda](https://aws.amazon.com/lambda/) functions from a
[AWS CloudFormation](https://aws.amazon.com/cloudformation/) template.
This is useful if you have lots of Lambda functions in your stack and
need to (temporary) update their environment variables without performing a re-deployment of your whole stack.

### Notes
- Before you use *lambda-cfn-env*, make sure that your CloudFormation stack exists, i.e. you've successfully
deployed it at least once.
- Use at your own risk.


## Install

### npm
```
npm install -g lambda-cfn-env
```

### yarn

```
yarn global add lambda-cfn-env
```

## Usage

### save

Adds an environment variable key-value pair to all Lambda functions.

```
lambda-cfn-env
    save
    --stack stack-name
    --region region
    --env Key=Value
    [--debug]
```

**--stack** the stack name for your CloudFormation template

**--region** the region of your CloudFormation stack and Lambda functions

**--env** a key value pair to set one environment variable, e.g. `Key=Value`

**--debug** optional: prints out some further debug logs.


### remove

Removes an environment variable key-value pair from all Lambda functions.

```
lambda-cfn-env
    remove
    --stack stack-name
    --region region
    --env Key
    [--debug]
```

**--stack** the stack name for your CloudFormation template

**--region** the region of your CloudFormation stack and Lambda functions

**--env** a key to remove one environment variable, e.g. `Key`

**--debug** optional: prints out some further debug logs.


## Author

[Sebastian Hesse](https://www.sebastianhesse.de)


## License

MIT License

Copyright (c) 2018 [Sebastian Hesse](https://www.sebastianhesse.de)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
