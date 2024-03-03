import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";
import compression from 'vite-plugin-compression2';
import { visualizer } from 'rollup-plugin-visualizer'
import build_config from "./build-config.json";

// https://vitejs.dev/config/
export default build_config["single-file"]
    ? defineConfig({
        plugins: [
            visualizer(),
            react(),
            viteSingleFile(),
            {
                name: "markdown-loader",
                transform(code, id) {
                    if (id.slice(-3) === ".md") {
                        // For .md files, get the raw content
                        return `export default ${JSON.stringify(code)};`;
                    }
                }
            }
        ],
        build: {
            copyPublicDir: false,
            outDir: "./release",
        },
        debug: true,
    })
    : defineConfig({
        plugins: [
            visualizer(),
            react(),
            compression({
                algorithm: 'gzip', exclude: [/\.(br)$ /, /\.(gz)$/]
            }),
            {
                name: "markdown-loader",
                transform(code, id) {
                    if (id.slice(-3) === ".md") {
                        // For .md files, get the raw content
                        return `export default ${JSON.stringify(code)};`;
                    }
                }
            }
        ],
        base: "./",
        debug: true,
    });
