'use strict';
const logger = require('./logger.js');
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const app = express();
const getIP = require('ipware')().get_ip;
const config = require('./config.json');
const readline = require('readline');
const si = require('systeminformation');
const now = require('performance-now');
const process = require('process');
const axios = require('axios');
const rateLimit = require("express-rate-limit");
const colors = require('colors');
const os = require('os');
const limiter = rateLimit({
  windowMs: 1000,
  max: config.limit_request.limti,
  message: {
    error: config.limit_request.message
  }
});

async function getCpuBrand() {
  try {
    const cpuInfo = await si.cpu();
    const cpuBrand = cpuInfo.brand;
    return cpuBrand;
  } catch (error) {
    console.error(error);
  }
}

async function getRamInfo() {
  try {
    const ramInfo = await si.mem();
    const totalRam = formatBytes(ramInfo.total);
    return {
      total: totalRam
    };
  } catch (error) {
    console.error(error);
  }
}

async function getNodejsInfo() {
  try {
    const nodeVersion = process.version;
    return nodeVersion;
  } catch (error) {
    console.error(error);
  }
}

async function getLatestNodeVersion() {
  try {
    const response = await axios.get('https://nodejs.org/dist/index.json');
    const versions = response.data;
    versions.sort((a, b) => new Date(b.date) - new Date(a.date));
    const latestVersion = versions[0].version;
    const majorVersion = latestVersion.split('.')[0];
    return majorVersion;
  } catch (error) {
    console.error(error);
  }
}

function formatBytes(bytes) {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function startApp() {
  process.env.UV_THREADPOOL_SIZE = os.cpus().length;
  logger.info("Starting ZeidAPI " + config.version);

  const start = now();

  const cpuBrand = await getCpuBrand();
  logger.info("System Info:");
  logger.info("  CPU: " + cpuBrand);

  const ramInfo = await getRamInfo();
  logger.info("  RAM: " + ramInfo.total);

  const nodejsInfo = await getNodejsInfo();
  logger.info("  NODEJS: " + nodejsInfo);

  if (nodejsInfo.split('.')[0].replace("v", "") >= "v18") {
    logger.error("NodeJS versions below 18 are not supported")
    process.exit(0);
  }

  logger.info("Loading Module:\n");

  const server = require("./server.js");

  app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']);
  app.use(helmet());
  app.use(express.json());
  app.use(cors());
  app.use(function(req, res, next) {
    var ipInfo = getIP(req);
    if (config.blockIP.enable == true) {
      var block = require(config.blockIP.file);
      if (block.includes(ipInfo.clientIp)) return res.json({
        error: `${config.blockIP.message}`
      });
    }
    logger.info(`${ipInfo.clientIp} Request To: ${decodeURIComponent(req.url)}`);
    next();
  })


  if (config.limit_request.enable) app.use(limiter);
  app.use("/", server);
  app.set("json spaces", 4);
  app.use((error, req, res, next) => {
    res.status(error.status).json({
      message: error.message
    });
  });

  logger.info("Loading Config:\n");
  logger.config("Block IP", config.blockIP.enable);
  logger.config("Limit Request", config.limit_request.enable);

  app.set('port', (config.port || 5000));

  app.get('/', function(req, res) {
    res.redirect(config.url_docs)

  }).listen(app.get('port'), async function() {
    const end = now();
    const duration = ((end - start) / 1000).toFixed(3);
    const latestVersion = await getLatestNodeVersion();
    logger.info("Server is listening on 0.0.0.0:" + app.get('port') + " TCP");
    logger.info("Url docs api is " + config.url_docs + "\n");
    logger.info(`Done (${duration}s)! For help, type "/help"\n`);
    if (nodejsInfo.split('.')[0] != latestVersion) logger.warn("Your NodeJS version is old, update to the latest version to work better\n")

    rl.on('line', (input) => {
      const command = input.trim().replace("/", "");
      if (command === 'help') {
        logger.info('==== Help ====');
        logger.info('Available commands:');
        logger.info('  /help'.cyan + '   - Show Help');
        logger.info('  /stop'.cyan + '   - Stop Server');
        logger.info('  /module'.cyan + ' - Check Module');
        logger.info('==============');
      } else if (command === 'stop') {
        logger.info('Stopping the server...');
        process.exit(0);
      } else if (command === 'mdl' || command === "module") {
        const listmodule = require("./module-list.json");
        console.log(`Module (${listmodule.length}): ${listmodule.join(', ').cyan}`);
      } else if (command == "ban") {
        const regex = /\d+(\.\d+)+/;
        const matches = command.replace("ban", "").match(regex);
        if (matches) {
          const number = matches[0];
          console.log(`Ban ${number}`);
        } else {
          console.log(`Is a not IP.`);
        }
      } else {
        logger.info('Command not found. Type "/help" for help.');
      }
    });
  });
}

startApp();