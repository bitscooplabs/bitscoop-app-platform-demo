# BitScoop Alexa Demo

You can build with any API on the BitScoop platform which makes being a software developer more interesting than ever.
In this demo, we demonstrate how to build a simple webpage that charts key metrics about your software stack

## Create/configure accounts with Postman, Google, and StatusCake

You need to create a BitScoop account via (https://bitscoop.com/signup) as well as an AWS account.
You will need to create a Postman Pro account, a Google account, and/or a StatusCake account to use those services in this demo.
For the sake of brevity we will not cover the specifics here, but you can find step-by-step instructions in our blog post about this demo at <INSERT_LINK_HERE>.

## Add API Maps to BitScoop

Note that this step is identical to the Alexa Skill and Data Science Platform demos, so if you have already set up either of those demos you can skip to the next step.

To quickly get started with what you'll need on BitScoop, you can add the following API Maps using the buttons below.
Note that you do not need to use all of these services for the demo to run, as the Amazon Lambda function that powers the Alexa Skill will adjust automatically based on how you configure it.
You only need to add the ones to BitScoop that you want to try for yourself.
Make sure to substitute the values for the API keys, client IDs, and client secrets where appropriate.

| API Map   | File Name       |                                                                                                                                                                                                                                    |
|----------------|-----------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Postman Pro API Monitors | postman.json | [![Add to BitScoop](https://assets.bitscoop.com/github/AddBitScoopXSmall.png)](https://bitscoop.com/maps/create?source=https://raw.githubusercontent.com/bitscooplabs/bitscoop-alexa-demo/master/fixtures/maps/postman.json) |
| Google Analytics Data | google_analytics.json | [![Add to BitScoop](https://assets.bitscoop.com/github/AddBitScoopXSmall.png)](https://bitscoop.com/maps/create?source=https://raw.githubusercontent.com/bitscooplabs/bitscoop-alexa-demo/master/fixtures/maps/google.json) |
| StatusCake Health Alerts | statuscake.json | [![Add to BitScoop](https://assets.bitscoop.com/github/AddBitScoopXSmall.png)](https://bitscoop.com/maps/create?source=https://raw.githubusercontent.com/bitscooplabs/bitscoop-alexa-demo/master/fixtures/maps/statuscake.json) |
| GitHub Issues | github.json | [![Add to BitScoop](https://assets.bitscoop.com/github/AddBitScoopXSmall.png)](https://bitscoop.com/maps/create?source=https://raw.githubusercontent.com/bitscooplabs/bitscoop-alexa-demo/master/fixtures/maps/github.json) |

## Authorize Google Analytics (only if using that service)

Make a POST request to the Connection URL shown on the Details page for the Google Analytics map; it will be in the form https://api.bitscoop.com/<map_id>/connections.
The response body will contain two fields, 'redirectUrl' and 'id'.
Save 'id', which is the ID of the new connection, for later, and go to the redirectUrl in a browser.
Google should request authorization for the Analytics API for one of your Google accounts.
If successful, you should be able to make calls via that map with the header 'X-Connection-Id: <connection_id>'.

Also make sure that you have created an API key for BitScoop, as all calls to the BitScoop API must be signed with one.

## Download and build this Project
Unlike our other demos, you must build part of this project yourself before uploading. You will need to have node.js and `npm` installed on your machine so that you can compile and bundle the static files before uploading them to S3. You may also locally build the backend files that will be uploaded to Lambda, but if you do not want to, you can download a pre-zipped copy of the backend at https://github.com/bitscooplabs/bitscoop-data-visualizer-demo/archive/master.zip

Download the project from https://github.com/bitscooplabs/bitscoop-data-visualizer-demo.
From the top level of this directory, run

```
npm install
```

to install all of the project-wide dependencies, then go to /src and again run

```
npm install
```

Finally go back to the top level and run the command

```
gulp bundle
```

to zip the backend portion of the project to dist/bitscoop-data-science-demo-<version>.zip

# Set up an RDS box and configure networking
This demo is built on top of the work done in the [Data Science demo](https://github.com/bitscooplabs/bitscoop-data-science-demo); in particular it assumes that there’s an RDS box set up with data from Google Analytics, GitHub, Postman, and/or StatusCake.
If you have run that demo, you can skip to step 4.
The instructions for setting up the networking and infrastructure are repeated here in case you have not done that demo, but we’ve removed the steps for creating the Lambda function to fetch data and put it into RDS.
If you are only running this demo, you will need to add that data to the RDS box manually.
The ‘metrics’ database within that box should have the following tables with the attendant columns:

* google_analytics
  * id - integer, primary key
  * date - date
  * total_users - integer
  * new_users - integer
* github
  * id - integer, primary key
  * date - date
  * issues - integer
* postman
  * id - integer, primary key
  * date - date
  * status - boolean
* statuscake
  * id - integer, primary key
  * date - date
  * outages - integer

There are many SQL clients that make it easy to interact with a SQL database; [SQuirreL](http://squirrel-sql.sourceforge.net/) is one such client, but use whatever you want.

You first need to set up some network configurations.
We’re going to create everything from scratch so that you don’t interfere with anything you may already have in AWS.

Go to [IAM roles](https://console.aws.amazon.com/iam/home#/roles) and create a new role.
Click Select next to AWS Lambda. You will need to add three policies to this role:
* AWSLambdaBasicExecution
* AWSLambdaCloudFormation
* AWSLambdaVPCAccessExecution

Click Next Step, give the role a name, and then click Create Role.
This role will be used by the Lambda function to specify what it has permission to access.

Go to your [VPCs](https://console.aws.amazon.com/vpc/home#vpcs:) and create a new one.
Tag it with something like ‘bitscoop-demo’ so you can easily identify it later.
For the IPv4 CIDR block, enter 10.0.0.0/16, or something similar if that is already taken.
Leave IPv6 CIDR block and tenancy as their defaults and create the VPC.

View your [Subnets](https://console.aws.amazon.com/vpc/home#subnets).
You should create four new subnets.
Two of these will be public subnets, and two will be private.
Call the public ones ‘public1’ and ‘public2’, and the private ones ‘private1’ and ‘private2’.
Make sure they are all on the ‘bitscoop-demo’ VPC we created.
One public and one private subnet should be in the same availability zone, and the other public and private subnets should be in different AZs, e.g. public1 in us-east-1a, public2 in us-east-1c, private1 in us-east-1a, and private2 in us-east-1b.
Remember which AZ is shared between a public and private subnet for later.
The CIDR block needs to be different for each subnet and they all need to fall within the CIDR block of the VPC; if the VPC block is 10.0.0.0/16, you could use 10.0.0.0/24, 10.0.1.0/24, 10.0.2.0/24, and 10.0.3.0/24.
AWS will let you know if anything overlaps.

Go view your [NAT Gateways](https://console.aws.amazon.com/vpc/home#NatGateways).
Create a new Gateway, and for the subnet pick the public subnet that shares an AZ with a private subnet, e.g. ‘public1’ in the example above.
Click Create New EIP and then Create the gateway.
This new gateway should have an ID nat-<ID>.
It should be noted that, while almost everything in this demo is part of AWS’ free tier, NAT gateways are NOT free.
They’re pretty cheap, at about $0.05 per hour and $0.05 per GB of data processed, but don’t forget to delete this when you’re done with the demo (and don’t forget to create a new one and point the private route table to the new one if you revisit this demo).

Go to [Route Tables](https://console.aws.amazon.com/vpc/home#routetables) and create two new ones.
Name one ‘public’ and the other ‘private’, and make sure they’re in the ‘bitscoop-demo’ VPC.
When they’re created, click on the ‘private’ one and select the Routes tab at the bottom of the page.
Click Edit, and add another route with a destination of 0.0.0.0/0 and a target of the NAT gateway we just created (so nat-<ID>, not igw-<ID>).
Save the private route table.

Go back to the subnets and click on one of the ‘private’ ones.
Click on the Route Table tab, click Edit, and change it in the dropdown to the ‘private’ Route Table that you created in the previous step.
Then click Save.
Repeat this for the other ‘private’ subnet.

You also need to create a couple of [Security Groups](https://console.aws.amazon.com/vpc/home#securityGroups:).
Name the first one ‘rds’ and make sure it’s in the ‘bitscoop-demo’ VPC, then create it.
Click on it in the list, click on the Inbound Rules tab, and then click Edit.
You’ll want to add a MySQL/Aurora rule (port 3306) for 10.0.0.0/16 (or whatever CIDR block you picked for the VPC) so Lambda can access the RDS box internally.
If you want to make sure that the box you’re going to set up is working as intended, you can also add a MySQL/Aurora rule for your IP address.
You do not need to add any Outbound Rules.

You also need to add a Security Group called ‘lambda’.
This does not need any Inbound Rules, but it does need Outbound Rules for HTTP (80) to 0.0.0.0/0 and HTTPS (443) to 0.0.0.0/0.

Finally, you will set up the [RDS box](https://console.aws.amazon.com/rds/home) to store the data that will be generated.
Click on Instances and select Launch DB Instance.
For this demo we are using MySQL; if you wish to use a different database, you may have to install a different library in the demo project and change the Sequelize dialect to that db.

Click on MySQL (or whatever Engine you want) and then click the Select button next to the version you wish to use (MySQL only has one version as of this publication).
On the ‘Production?’ page we recommend selecting the Dev/Test instance of MySQL to minimize the cost to you; test instances can be run cost-free as part of AWS’ free tier.
Click Next Step to go to ‘Specify DB Details’.
On this page you can click the checkbox ‘Only show options that are eligible for RDS Free Tier’ to ensure you don’t configure a box that costs money.

Select a DB Instance class; db.t2.micro is normally free and should be sufficient for this demo, as should the default storage amount (5GB as of publication).
Pick a DB Instance Identifier, as well as a username and password.
Save the latter two for later reference, as you will need to set Environment Variables in the Lambda function for them so that the function can connect to the DB.
Click Next Step.

On the Advanced Settings screen, select the ‘bitscoop-demo’ VPC.
Under VPC Security Group(s), select the ‘rds’ group we created earlier.
Make sure to give the database a name and save this name for later use, as it too will need to be added to an Environment Variable.
Also make sure the box is publicly accessible, and make sure the Availability Zone is the one that’s shared between a public and private subnet (us-east-1a in the above example).
Click Launch DB Instance.

Go to your [RDS instances](https://console.aws.amazon.com/rds/home#dbinstances).
When the box you just created is ready, click Instance Actions, then See Details.
Look at the second column, Security and Network.
Take note of the Endpoint field near the bottom.
Save this for later use, as it will be used in another Environment Variable.

## Deploy API code to Amazon Lambda, create API Gateway, deploy static files to S3
First we’re going to create a Lambda function to serve as an API endpoint for retrieving and formatting our stack data.
Go to your [Lambda functions](https://console.aws.amazon.com/lambda/home#/functions?display=list) and Create a new function.
Select ‘Blank Function’ for the blueprint.
Don’t select any triggers, just click Next.
Name the function; for reference we’ll call this ‘stack-data-get’.
Make sure the runtime is ‘Node.js 6.10’.
Select ‘Upload a ZIP file’ for Code Entry Type and upload the .zip file for the project (run gulp bundle from the top level of the project to compile it to the dist/ folder if it’s not present).
Select the ‘demo’ service role we created earlier and make sure the handler is ‘index.handler’.

You will need to add several Environment Variables, with the number depending on how many services you wish to run.
You will always need to add the following variables:

* BITSCOOP_API_KEY (obtainable at https://bitscoop.com/keys)
* PORT (by default it’s 3306)
* HOST (the endpoint for the RDS box, \<Box name>.\<ID>.\<Region>.rds.amazonaws.com)
* USER (the username you picked for the RDS box)
* PASSWORD (the password you set for the RDS box)
* DATABASE (the database name you set for the RDS box)

For each service that you wish to retrieve data from, add an Environment Variable where the key is its name and the value is true (the value can really be anything, as the backend code just checks if the variable is present).
The accepted variables are:

* GOOGLE
* GITHUB
* POSTMAN
* STATUSCAKE

Open the Advanced Settings and set the timeout to 10 seconds to give the function some breathing room.
Select the ‘demo’ VPC we created and add the two ‘private’ subnets we created earlier.
Add the ‘lambda’ security group, then click Next.
After reviewing everything on the next page, click ‘Create function’.

Next we will create an API gateway to handle traffic to the endpoint that will serve up the formatted data.
Go to the [API Gateway home](https://console.aws.amazon.com/apigateway/home) and click Get Started.
Name the API whatever you want; for reference purposes we’ll call it ‘stack-data’.
Make sure the type is ‘New API’ and then click Create.

You should be taken to the API you just created.
Click on the Resources link if you aren’t there already.
Highlight the resource ‘/’ (it should be the only one present), click on the Actions dropdown and select ‘Create Method’.
Click on the blank dropdown that appears and select the method ‘GET’, then click the checkbox next to it.
Make sure the Integration Type is ‘Lambda Function’.
Leave ‘Use Lambda Proxy integration’ unchecked, select the region your Lambda function is in, and enter the name of that Lambda function, then click Save.
Accept the request to give the API gateway permission to access the Lambda function.

Click on the ‘GET’ method, and to the right you should see a flowchart with four boxes positioned between a ‘client’ box and a ‘lambda’ box.
Click on ‘Method Request’.
Add two URL Query String Parameters ‘endDate’ and ‘startDate’, making sure to click the checkbox after entering the names to save them.
Neither is required.

Go back to Method Execution (either through the link or by clicking on the method again) and click on ‘Integration Request’.
Open the Body Mapping Templates accordion and click on the middle radio button for Request body passthrough (‘When there are no templates defined (recommended)’).
Click on Add Mapping Template and enter ‘application/json’ into the box that appears, the click the checkbox.
In the code window that appears enter

```
{
    "startDate": "$input.params('startDate')",
    "endDate": "$input.params('endDate')"
}
```

and click Save.
This passes the parameters sent to the API call to fields on the event that’s passed to the Lambda function.

The final thing to do is get the URL at which this API is available.
Click ‘Stages’ on the far left, underneath the ‘Resources’ of this API.
By default a ‘prod’ stage has been created, so click on that.
The URL should be shown as the ‘Invoke URL’ in the top middle of the page on a blue background.

You need to copy this URL into a file before deploying the code to S3.
In the project, go to static/js/site.js.
Near the top of the file you should see `var apiUrl = ‘’;`
Paste the Invoke URL into the quotes.
Navigate to the top level of the project and run

```
gulp build
```

to compile and package all of the static files to the dist/ folder.

Lastly we’re going to create an S3 bucket to host our site. Go to [S3](https://console.aws.amazon.com/s3/home) and create a new bucket.
Give it a name and select the region that’s closest to you, then click Next.
You can leave Versioning, Logging, and Tags disabled, so click Next.
Open the ‘Manage Group Permissions’ accordion and give Everyone Read access to Objects (NOT Object Permissions).
Click Next, review everything, then click Create Bucket.

Click on the Bucket in the list.
Go to the Properties tab and click on Static Website Hosting.
Take note of the Endpoint url at the top of this box, as that is the url you will hit to see the demo page in action.
Select ‘Use this bucket to host a website’ and enter ‘index.html’ for the Index Document (you should leave the Error Document blank), then click Save.

Go to the Objects tab and click Upload to have a modal appear.
Click Add Files in this modal and navigate to the ‘dist’ directory in the bitscoop-data-visualizer-demo directory, then into the directory below that (it’s a unix timestamp of when the build process was completed).
Move the file system window so that you can see the Upload modal.
Click and drag the static folder and the index.html file over the Upload modal (S3 requires that you drag-and-drop folders, and this only works in Chrome and Firefox).
Close the file system window, then click Next.
Open the ‘Manage Group Permissions’ accordion and give Everyone read access to Objects.
Click Next, then Next again, then review everything and click Upload.

If all has gone well, you should be able to go to the S3 bucket’s URL, see the graphs, and the graphs should be populated with data from the last month if the RDS box which the Lambda function is calling has data.
You can put start and end dates to change the timespan of data that will be rendered.

## Retrieve data from multiple endpoints (optional)
The end result of what we've set up above has only a single endpoint that formats all of the data the same way before returning it, with the client doing not much more than feeding the data into chart.js.
Not everyone may want to follow this pattern, however, or may not want their backend to handle data formatting and manipulation.
This second part will construct the demo in a different way - instead of one API endpoint that returns everything, there will be one endpoint for each data source, and the endpoints will just return the data as-is, leaving the client to handle the formatting.

You will need to create a Lambda function for each service that you want to use. To bundle the .zip files for all four services at once, run

```
gulp bundle:individual
```

This will place four zip files in the dist/ folder, each named ‘bitscoop-data-visualizer-demo-<service>-<version>.zip’.
If you want to create these individually, run

```
gulp bundle:<service>
```

where <service> is one of ‘github’, ‘google’, ‘postman’, or ‘statuscake’, e.g.

```
gulp bundle:google
```

The instructions for creating a Lambda function for each of these is exactly the same as in part 1, apart from uploading the service-specific zip file.
You also do not need to add any environment variables enabling the services, just the five related to the RDS box.

The other major difference is that the API gateway needs to have routes pointing to each endpoint.
Go to the resources for the API gateway you created and click on the '/' resource.
Click on the Actions dropdown and select ‘Create Resource’.
Enter the name of one of the services for the Resource Name, e.g. ‘github’, and by default the Resource Path should be filled in to match.
Leave the checkboxes unchecked, then click Create Resource.
Follow the instructions from part 1 about creating a GET method pointing to the Lambda function you created for that service.

Repeat this step for each service for which you’ve created a Lambda function; make sure to click on and highlight the top-level ‘/’ route before creating each new resource.
When you’ve added resources for all of the services you want to use, highlight the top-level ‘/’ route, then click on the Actions dropdown and select ‘Enable CORS’, then click on the blue button to enable CORS.
Also make sure to re-deploy the API once all of the resources are set up.
