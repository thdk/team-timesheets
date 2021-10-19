// Imports the Google Cloud client library
import { BigQuery } from '@google-cloud/bigquery';
import { BigQueryTableSchemes } from './config';

export type BigQueryField = { name: string, type: string, mode?: string };
export type BigQueryConfig = {
    dataSetId: string;
    tableId: string;
    tableIdPrefix: string,
    schemes: BigQueryTableSchemes,
    timePartitioningField?: string,
};

function validateTableSchemaAsync(table: any, schema: BigQueryField[]) {
    return table.getMetadata().then(([metadata]) => {
        if (metadata.schema) {
            console.log(`Current schema of table ${table.id} is ${JSON.stringify(metadata.schema.fields)}`);
        } else {
            console.log("Table has no schema yet.");
        }

        console.log(`Required schema of table ${table.id} is ${JSON.stringify(schema)}`);

        if (!isEqualSchema(metadata.schema.fields, schema)) {
            console.log(`Updating schema of table ${table.id}...`);
            return table.setMetadata(Object.assign(metadata, { schema }))
                .then(() => {
                    console.log("Schema updated.");
                    return table;
                }, () => {
                    console.log("Couldn't update schema of table: " + table.id);
                });
        }
        else {
            console.log(`Schema of table ${table.id}... is already up to date.`);
            return new Promise(resolve => resolve(table));
        }
    });
}

function isEqualSchema(schema1: BigQueryField[], schema2: BigQueryField[]) {
    console.log(`Comparing fields length... ${schema1.length} <> ${schema2.length}`);
    if (schema1.length !== schema2.length) return false;

    return !schema1.some((field1, index) => {

        const field2 = schema2[index];
        console.log(`Comparing field...`);
        console.log(`${JSON.stringify(field1)}`);
        console.log(`${JSON.stringify(field2)}`);

        return field1.name !== field2.name ||
            field1.type !== field2.type ||
            field1.mode !== field2.mode;
    });
}

type InsertOptions = {
    schema: BigQueryField[];
    location: string;
    timePartitioning?: {
        type: 'DAY';
        field: string;
    };
}
export function insertRowsAsync<T>(options: BigQueryConfig, rows: ReadonlyArray<T>, bigqueryClient?: BigQuery): Promise<void> {
    const { dataSetId, tableId, tableIdPrefix = "", schemes, timePartitioningField } = options;

    console.log(`Inserting ${rows.length} rows into ${tableId}`);

    let insertOptions: InsertOptions = {
        schema: schemes[tableId],
        location: 'US'
    };

    if (timePartitioningField) {
        insertOptions = {
            ...insertOptions,
            timePartitioning: {
                type: 'DAY',
                field: timePartitioningField,
            },
        }
    }

    if (!rows.length) return new Promise(resolve => resolve());

    const bigquery = bigqueryClient || new BigQuery();

    // TODO: create dataset only once since insertRows can be called multiple times simultaneously!
    return bigquery
        .dataset(dataSetId)
        .get({ autoCreate: true })
        .then(([dataset]) => {
            console.log("dataset created");
            return dataset.table(`${tableIdPrefix}${tableId}`)
                .get({ autoCreate: true, ...insertOptions })
                .then(([table]) => validateTableSchemaAsync(table, insertOptions.schema))
                .then(table => {
                    const first10kRows = rows.slice(0, 10000);
                    return table.insert(first10kRows)
                        .then(() => {
                            console.log(`Inserted ${first10kRows.length} rows of total ${rows.length} into ${tableId}`);
                            if (rows.length > 10000) {
                                console.log("Inserting next batch...")
                                return insertRowsAsync(options, rows.slice(10000));
                            }

                            console.log(`Finished inserting into ${tableId}`);
                            return true;
                        }, (error: { errors: any, name: string, response: any, message: string }) => {
                            error.errors && error.errors.forEach(e => {
                                console.log({
                                    error: error.name,
                                    message: error.message,
                                    errors: e.errors,
                                    row: e.row
                                });
                            });
                        }, (e) => {
                            console.log(e);
                            console.log("Table could not be created");
                        })
                })
        }, e => {
            console.log(e);
            console.log("Dataset could not be created");
        });

}