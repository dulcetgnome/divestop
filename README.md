# dulcetgnome [![Build Status](https://travis-ci.org/dulcetgnome/dulcetgnome.svg?branch=master)](https://travis-ci.org/dulcetgnome/dulcetgnome)
Greenfield Project

> Pithy project description

## Team

  - Product Owner: Ron Fenolio
  - Scrum Master: Corey Roy
  - Development Team Members: Steven Lundy, Garrett Maring

## Table of Contents

1. [Usage](#Usage)
1. [Requirements](#requirements)
1. [Development](#development)
    1. [Installing Dependencies](#installing-dependencies)
    1. [Tasks](#tasks)
1. [Team](#team)
1. [Contributing](#contributing)

## Usage

> Some usage instructions

## Requirements

- Node 0.10.x
- Redis 2.6.x
- Postgresql 9.1.x
- etc
- etc

## Development

### Installing Dependencies

From within the root directory:

```sh
sudo npm install -g bower
npm install
bower install
grunt watch
```

###Testing & Building

We use grunt for managing all of our tests. Running `grunt test` will lint and run all test in the test directory.

`grunt test-server`: Will run tests in test/server directory
`grunt test-client`: Will run tests in test/client directory

Run `grunt watch` to listen for changes. If sass files are added or changed, it will compile out to style.css. If javascript is changed it will run linter, the correct tests (server or client), and then uglify if passing. Notifications are enabled for failing tests, or linting errors.

Look at the Gruntfile.js for more tasks.

All files are built to the client/build/ directory. The javascript file and css file located there should be the two includes in the html. Libraries are not being minified and should be included per usual with preference towards their minified versions. 

In addition, we are using Travis for continuous integration. Whenever a PR is opened, Travis will run all tests, lint, and create a temporary database (for further testing). If this passes the status of the PR will update from 'pending' to 'open'.

###API

> /api/sites - [GET]

  Request to here will return all dive sites in the world as a JSON object with the following properties:
  -_id
  -site
  -location
  -coordinates
  -max-depth
  -gradient
  -description
  -aquatic_life (as array)
  -pictures (as array)
  -features (as array)
  -comments

### Roadmap

View the project roadmap [here](LINK_TO_PROJECT_ISSUES)


## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.
