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

Remove the environment `env:<environment_name>`. This requires soft delete to be completed before TTL time, so that the values in Cloudflare KV is propagated. This also checks there's no associated groups again.

### List Config Groups

Return a list of config groups by listing `group:` prefix.

## Create Config Group

Put a new key `group:<group_name>` with empty value.

## Associate a Config Group with an Environment

Adds environment to `group:<group_name>` and adds config group to `env:<environment_name>`.

## Soft Delete Config Group

Mark config group as deleted, and add a deleted date. It also performs a list optional with prefix `entry:<group_name>:` and the response should be empty.

## Hard Delete Config Group

Delete the config group `group:<group_name>`. This requires soft delete to be completed before TTL time, so that the values in Cloudflare KV is propagated. It also checks there's no config entries with prefix `entry:<group_name>:` again.

### List Config Entries

List config entries filtered by config group and optionally environment.

This operation does two queries. First it gets `group:<group_name>` to make sure group is not soft deleted. Then it returns the config entries by listing `entry:` prefix.

The value of `group:<group_name>` is cached.

### Get a Config Entry

Returns a config entry providing environment, group, and config name. The operation makes sure `group:<group_name>` is not soft deleted and then queries key `entry:<group_name>:<environment_name>:<key>`.

The value of `group:<group_name>` is cached.

### Remove a Config Entry

Delete the key `entry:<group_name>:<environment_name>:<key>`.

Even if `group:<group_name>` is soft deleted, this operation is allowed, so that any key created during TTL time can still be removed.
