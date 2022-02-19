"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const secrets_json_1 = require("../secrets.json");
function metaMask() {
    return __awaiter(this, void 0, void 0, function* () {
        const wallet = ethers_1.ethers.Wallet.fromMnemonic(secrets_json_1.mnemonic);
        // console.log(account)
        console.log(wallet.address);
        yield wallet.signMessage('hello');
        let tx = {
            to: '0x8F46CeCCA40c4bBDa75b13148D6196C74a875311',
            value: ethers_1.utils.parseEther('0.01')
        };
        yield wallet.signTransaction(tx);
        let provider = new ethers_1.ethers.providers.InfuraProvider("rinkeby", secrets_json_1.infuraKey);
        let defaultProvider = ethers_1.ethers.getDefaultProvider("rinkeby");
        let bal = yield defaultProvider.getBalance(wallet.address);
        console.log(bal.toString());
        let wal = wallet.connect(provider);
        let address = yield wal.getAddress();
        let ballance = yield wal.getBalance();
        let chainId = yield wal.getChainId();
        let gasPrice = yield wal.getGasPrice();
        let count = yield wal.getTransactionCount();
        console.log(address);
        console.log(ballance.toString());
        console.log(count);
        console.log(chainId);
        console.log(gasPrice.toString());
        yield wal.sendTransaction(tx);
    });
}
metaMask();
