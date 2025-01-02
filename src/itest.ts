#!/usr/bin/env node

import http from "http";
import chalk from "chalk";
import { intro, outro, spinner, log } from "@clack/prompts";
import { performance } from "perf_hooks";
import ProgressBar from "progress";

// Function to test download speed
const testDownloadSpeed = async (url: string, sizeInMB: number): Promise<number> => {
    const startTime = performance.now();
    const bar = new ProgressBar("  Downloading [:bar] :percent", {
        total: sizeInMB,
        width: 30,
        complete: "=",
        incomplete: " ",
    });

    return new Promise<number>((resolve, reject) => {
        http.get(url, (res) => {
            let receivedMB = 0;
            const chunkSize = 1024 * 1024; // 1 MB chunks

            res.on("data", (chunk) => {
                const chunkMB = chunk.length / chunkSize; // Convert chunk size to MB
                receivedMB += chunkMB;
                bar.tick(chunkMB); 
            });

            res.on("end", () => {
                const endTime = performance.now();
                const durationInSeconds = (endTime - startTime) / 1000;
                const downloadSpeed = (receivedMB / durationInSeconds) * 8; // Speed in Mbps
                resolve(downloadSpeed);
            });

            res.on("error", (err) => {
                reject(new Error(`Error during download: ${err.message}`));
            });
        }).on("error", (err) => {
            reject(new Error(`Request error: ${err.message}`));
        });
    });
};


const main = async () => {
    intro(chalk.blue.bold("🚀 Internet Speed Tester"));

    const loadSpinner = spinner();
    try {
        // Test Download Speed
        loadSpinner.start(chalk.cyan("Testing download speed..."));
        const downloadSpeed = await testDownloadSpeed("http://ipv4.download.thinkbroadband.com/100MB.zip", 10);
        loadSpinner.stop(chalk.green.bold(`Download Speed: ${downloadSpeed.toFixed(2)} Mbps`));


        log.success(chalk.green("✅ Test completed successfully!"));
    } catch (error: any) {
        loadSpinner.stop(chalk.red("❌ Error occurred during the test."));
        log.error(chalk.red(error.message || "An unknown error occurred."));
    }

    outro(chalk.yellow.bold("Thank you for using Internet Speed Tester!"));
};

main().catch((err) => {
    console.error(chalk.red("An unexpected error occurred:"), err);
    process.exit(1);
});
