# Design

## Definitions

## Environment

Environments are `production`, `staging`, etc.

Node: It should not be changed frequently.

## Config Groups

Config groups are the logical groupings of the configurations. This can be one project or multiple projects that are related to each other.

Note: It should not be changed frequently.

## Config Entry

Each configuration item with a name and value. The config names in each group and each environment must be unique.

## KV Database Design

- `env:<environment_name>`: Contains environment metadata and group list
- `group:<group_name>`: Contains group metadata and a list of environments
- `entry:<group_name>:<environment_name>:<key>`: Maps to entry value

## Operations

### List Environments

Returns a list of environments by listing `env:` prefix.

### Add Environment

Put a new key `env:<environment_name>` with empty value.

## Soft Delete Environment

Mark environment as deleted, and add a deleted date. It requires that no groups are associated with this environment.

## Hard Delete Environment

Remove the environment `env:<environment_name>`.

### List Config Groups

Return a list of config groups by listing `group:` prefix.

## Create Config Group

Put a new key `group:<group_name>` with empty value.

## Soft Delete Config Group

Mark config group as deleted, and add a deleted date. It also performs a list optional with prefix `entry:<group_name>:` and the response should be empty.\

## Hard Delete Config Group

Delete the config group `group:<group_name>`.

### List Config Entries

The list operation that returns the config entries by listing `entry:` prefix. This should be filtered by config group and optionally environment.

### Get a Config Entry

Returns a config entry providing environment, group, and config name. The operation queries key `entry:<group_name>:<environment_name>:<key>`.

### Remove a Config Entry

Delete the key `entry:<group_name>:<environment_name>:<key>`.
