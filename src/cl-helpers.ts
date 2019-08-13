import TruffleContract from 'truffle-contract'
import { linkToken } from './support/linkToken'

const abi = require('ethereumjs-abi')
const util = require('ethereumjs-util')
const BN = require('bn.js')
/* tslint:enable no-var-requires */

// https://github.com/ethereum/web3.js/issues/1119#issuecomment-394217563
// @ts-ignore
web3.providers.HttpProvider.prototype.sendAsync = web3.providers.HttpProvider.prototype.send

export const toHexWithoutPrefix = (arg: any): string => {
  if (arg instanceof Buffer || arg instanceof BN) {
    return arg.toString('hex')
  } else if (arg instanceof Uint8Array) {
    return Array.prototype.reduce.call(
    arg,
    (a: any, v: any) => a + v.toString('16').padStart(2, '0'),
    ''
    )
  } else if (Number(arg) === arg) {
    return arg.toString(16).padStart(64, '0')
  } else {
    return Buffer.from(arg, 'ascii').toString('hex')
  }
  }

export const toHex = (value: any): string => {
  return Ox(toHexWithoutPrefix(value))
}

export const Ox = (value: any): string =>
  value.slice(0, 2) !== '0x' ? `0x${value}` : value

const startMapBuffer = Buffer.from([0xbf])
const endMapBuffer = Buffer.from([0xff])

const autoAddMapDelimiters = (data: any): Buffer => {
  let buffer = data

  if (buffer[0] >> 5 !== 5) {
    buffer = Buffer.concat(
    [startMapBuffer, buffer, endMapBuffer],
    buffer.length + 2
    )
  }

  return buffer
}

export const decodeRunRequest = (log: any): any => {
  const runABI = util.toBuffer(log.data)
  const types = [
    'address',
    'bytes32',
    'uint256',
    'address',
    'bytes4',
    'uint256',
    'uint256',
    'bytes'
  ]
  const [
    requester,
    requestId,
    payment,
    callbackAddress,
    callbackFunc,
    expiration,
    version,
    data
  ] = abi.rawDecode(types, runABI)

  return {
    callbackAddr: Ox(callbackAddress),
    callbackFunc: toHex(callbackFunc),
    data: autoAddMapDelimiters(data),
    dataVersion: version,
    expiration: toHex(expiration),
    id: toHex(requestId),
    jobId: log.topics[1],
    payment: toHex(payment),
    requester: Ox(requester),
    topic: log.topics[0]
  }
}

export const fulfillOracleRequest = async (
  oracle: any,
  request: any,
  response: any,
  options: any
  ): Promise<any> => {
  if (!options) {
    options = { value: 0 }
  }

  return oracle.fulfillOracleRequest(
    request.id,
    request.payment,
    request.callbackAddr,
    request.callbackFunc,
    request.expiration,
    toHex(response),
    options
  )
}

const bNToStringOrIdentity = (a: any): any => (BN.isBN(a) ? a.toString() : a)

// Deal with transfer amount type truffle doesn't currently handle. (BN)
export const wrappedERC20 = (contract: any): any => ({
  ...contract,
  transfer: async (address: any, amount: any) =>
    contract.transfer(address, bNToStringOrIdentity(amount)),
  transferAndCall: async (
    address: any,
    amount: any,
    payload: any,
    options: any
  ) =>
    contract.transferAndCall(
    address,
    bNToStringOrIdentity(amount),
    payload,
    options
  )
})

export const linkContract = async (account: any): Promise<any> => {
  // @ts-ignore
  const receipt = await web3.eth.sendTransaction({
    data: linkToken.bytecode,
    from: account,
    gasLimit: 2000000
  })
  const contract = TruffleContract({ abi: linkToken.abi })
  // @ts-ignore
  contract.setProvider(web3.currentProvider)
  contract.defaults({
    from: account,
    gas: 3500000,
    gasPrice: 10000000000
  })

  return wrappedERC20(await contract.at(receipt.contractAddress))
}

export const encodeUint256 = (int: number) => {
  let zeros = '0000000000000000000000000000000000000000000000000000000000000000'
  let payload = int.toString(16)
  return (zeros + payload).slice(payload.length)
}

export const encodeInt256 = (int: number) => {
  if (int >= 0) {
  	return encodeUint256(int)
  } else {
	let effs = 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
    let maxUint256 = new BN('0x'+effs);
    let payload = maxUint256.plus(1).minus(Math.abs(int)).toString(16)
    return (effs + payload).slice(payload.length)
  }
}