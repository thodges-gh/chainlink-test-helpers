"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var truffle_contract_1 = __importDefault(require("truffle-contract"));
var linkToken_1 = require("./support/linkToken");
var abi = require('ethereumjs-abi');
var util = require('ethereumjs-util');
var BN = require('bn.js');
/* tslint:enable no-var-requires */
// https://github.com/ethereum/web3.js/issues/1119#issuecomment-394217563
// @ts-ignore
web3.providers.HttpProvider.prototype.sendAsync = web3.providers.HttpProvider.prototype.send;
exports.toHexWithoutPrefix = function (arg) {
    if (arg instanceof Buffer || arg instanceof BN) {
        return arg.toString('hex');
    }
    else if (arg instanceof Uint8Array) {
        return Array.prototype.reduce.call(arg, function (a, v) { return a + v.toString('16').padStart(2, '0'); }, '');
    }
    else if (Number(arg) === arg) {
        return arg.toString(16).padStart(64, '0');
    }
    else {
        return Buffer.from(arg, 'ascii').toString('hex');
    }
};
exports.toHex = function (value) {
    return exports.Ox(exports.toHexWithoutPrefix(value));
};
exports.Ox = function (value) {
    return value.slice(0, 2) !== '0x' ? "0x" + value : value;
};
var startMapBuffer = Buffer.from([0xbf]);
var endMapBuffer = Buffer.from([0xff]);
var autoAddMapDelimiters = function (data) {
    var buffer = data;
    if (buffer[0] >> 5 !== 5) {
        buffer = Buffer.concat([startMapBuffer, buffer, endMapBuffer], buffer.length + 2);
    }
    return buffer;
};
exports.decodeRunRequest = function (log) {
    var runABI = util.toBuffer(log.data);
    var types = [
        'address',
        'bytes32',
        'uint256',
        'address',
        'bytes4',
        'uint256',
        'uint256',
        'bytes'
    ];
    var _a = abi.rawDecode(types, runABI), requester = _a[0], requestId = _a[1], payment = _a[2], callbackAddress = _a[3], callbackFunc = _a[4], expiration = _a[5], version = _a[6], data = _a[7];
    return {
        callbackAddr: exports.Ox(callbackAddress),
        callbackFunc: exports.toHex(callbackFunc),
        data: autoAddMapDelimiters(data),
        dataVersion: version,
        expiration: exports.toHex(expiration),
        id: exports.toHex(requestId),
        jobId: log.topics[1],
        payment: exports.toHex(payment),
        requester: exports.Ox(requester),
        topic: log.topics[0]
    };
};
exports.fulfillOracleRequest = function (oracle, request, response, options) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        if (!options) {
            options = { value: 0 };
        }
        return [2 /*return*/, oracle.fulfillOracleRequest(request.id, request.payment, request.callbackAddr, request.callbackFunc, request.expiration, exports.toHex(response), options)];
    });
}); };
var bNToStringOrIdentity = function (a) { return (BN.isBN(a) ? a.toString() : a); };
// Deal with transfer amount type truffle doesn't currently handle. (BN)
exports.wrappedERC20 = function (contract) { return (__assign({}, contract, { transfer: function (address, amount) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, contract.transfer(address, bNToStringOrIdentity(amount))];
    }); }); }, transferAndCall: function (address, amount, payload, options) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, contract.transferAndCall(address, bNToStringOrIdentity(amount), payload, options)];
        });
    }); } })); };
exports.linkContract = function (account) { return __awaiter(_this, void 0, void 0, function () {
    var receipt, contract, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, web3.eth.sendTransaction({
                    data: linkToken_1.linkToken.bytecode,
                    from: account,
                    gasLimit: 2000000
                })];
            case 1:
                receipt = _b.sent();
                contract = truffle_contract_1.default({ abi: linkToken_1.linkToken.abi });
                // @ts-ignore
                contract.setProvider(web3.currentProvider);
                contract.defaults({
                    from: account,
                    gas: 3500000,
                    gasPrice: 10000000000
                });
                _a = exports.wrappedERC20;
                return [4 /*yield*/, contract.at(receipt.contractAddress)];
            case 2: return [2 /*return*/, _a.apply(void 0, [_b.sent()])];
        }
    });
}); };
exports.encodeUint256 = function (int) {
    var zeros = '0000000000000000000000000000000000000000000000000000000000000000';
    var payload = int.toString(16);
    return (zeros + payload).slice(payload.length);
};
exports.encodeInt256 = function (int) {
    if (int >= 0) {
        return exports.encodeUint256(int);
    }
    else {
        var effs = 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
        var maxUint256 = new BN('0x' + effs);
        var payload = maxUint256.plus(1).minus(Math.abs(int)).toString(16);
        return (effs + payload).slice(payload.length);
    }
};
