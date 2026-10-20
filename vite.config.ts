import {defineConfig} from 'vite';
export default defineConfig({root:'.',build:{outDir:'dist'},server:{host:'0.0.0.0',proxy:{'/api':'http://localhost:3000'}}});
