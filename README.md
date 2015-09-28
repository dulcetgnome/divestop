# dulcetgnome
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
```

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