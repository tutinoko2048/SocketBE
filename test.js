var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
var Server = require('./src').Server;
process.stdin.setEncoding("utf8");
var reader = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
});
var server = new Server({
    port: 8000,
    timezone: 'Asia/Tokyo'
});
server.events.on("serverOpen", function () {
    server.logger.log("open");
});
server.events.on("worldAdd", function (ev) {
    var world = ev.world;
    server.logger.info("connection opened: ".concat(world.name));
    world.sendMessage('connected');
});
server.events.on("worldRemove", function (ev) {
    var world = ev.world;
    server.logger.info("connection closed: ".concat(world.name));
});
server.events.on("playerJoin", function (ev) {
    var players = ev.players;
    server.logger.info("Joined: ".concat(players.join(', ')));
});
server.events.on("playerLeave", function (ev) {
    var players = ev.players;
    server.logger.info("Left: ".concat(players.join(', ')));
});
server.events.on("playerChat", function (ev) { return __awaiter(_this, void 0, void 0, function () {
    var sender, message, world;
    return __generator(this, function (_a) {
        sender = ev.sender, message = ev.message, world = ev.world;
        if (sender === '外部')
            return [2 /*return*/];
        world.logger.info("<".concat(sender, "> ").concat(message));
        world.sendMessage(message);
        return [2 /*return*/];
    });
}); });
server.events.on('error', function (e) {
    server.logger.error(e);
});
reader.on("line", function (line) {
    if (line.startsWith('/')) {
        server.runCommand(line).then(console.log);
    }
    else {
        try {
            var res = eval(line);
            console.log(res);
        }
        catch (e) {
            console.error('EvalError', e);
        }
    }
});
process.on('unhandledRejection', function (err) {
    server.logger.error(err);
});
