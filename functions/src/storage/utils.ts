import { Converter } from "csvtojson/v2/Converter";
import * as gcs from '@google-cloud/storage';

export const loadCsvAsync = <T>(bucket: string, file: string, deserialise: (data: any) => T) => {

    // Get the csv file from cloud storage as a json stream
    const csvConverter = new Converter();
    return new Promise<T[]>((resolve, reject) => {
        const storage = new gcs.Storage();
        const items = [] as T[];
        const gcsFile = storage
            .bucket(bucket)
            .file(file);

        console.log({ gcsFile });

        gcsFile
            .createReadStream()
            .pipe(csvConverter)
            .subscribe(data => {
                items.push(deserialise(data));
            })
            .on("data", _ => {
                // Without data event the stream never starts!
            })
            .on("error", err => {
                reject("The Storage API returned an error: " + err);
            })
            .on("end", () => {
                console.log("File streamed completely.");
                resolve(items);
            });
    });
}