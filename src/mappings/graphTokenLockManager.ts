import { ethereum, BigInt, Address } from '@graphprotocol/graph-ts'
import { TokenLockCreated } from "../../generated/GraphTokenLockManager/GraphTokenLockManager"
import { GraphTokenLockWallet } from "../../generated/GraphTokenLockManager/GraphTokenLockWallet"
import { createOrLoadGraphCirculatingSupply } from '../helpers'

let GTLW = Address.fromString('0x5785176048BEB00DcB6eC84A604d76E30E0666db')
let GTLW2 = Address.fromString('0x32Ec7A59549b9F114c9D7d8b21891d91Ae7F2ca1')

const ZERO = BigInt.fromI32(0)

export function handleTokenLockCreated(event: TokenLockCreated): void {
  let address = event.params.contractAddress.toHexString()
  let graphCirculatingSupply = createOrLoadGraphCirculatingSupply()

  let dynamicContracts = graphCirculatingSupply.dynamicContracts
  dynamicContracts.push(address)

  graphCirculatingSupply.dynamicContracts = dynamicContracts
  graphCirculatingSupply.save()
}

export function handleBlock(block: ethereum.Block): void {

  let circulatingSupply = createOrLoadGraphCirculatingSupply();
  let blockHeight = block.number

  // Pushing manual contracts that not were added by the manager.
  if (blockHeight.gt(BigInt.fromI32(11481574))) {
    circulatingSupply.dynamicContracts.push(GTLW.toHexString())
  }
  
  if (blockHeight.gt(BigInt.fromI32(11481571))) {
    circulatingSupply.dynamicContracts.push(GTLW2.toHexString())
  }

  circulatingSupply.blockHeight = blockHeight
  circulatingSupply.totalOutstandingValue = ZERO
  circulatingSupply.totalReleasedAmount = ZERO
  circulatingSupply.circulatingSupply = circulatingSupply.totalSupply

  let dc = circulatingSupply.dynamicContracts

  for(let i = 0; i < dc.length; i++) {

    let current = Address.fromString(dc[i])

    let gtlwContract = GraphTokenLockWallet.bind(current) 
    let outstandingAmount = gtlwContract.try_totalOutstandingAmount()
    let releasedAmount = gtlwContract.try_releasedAmount()

    let outstandingAmountValue = outstandingAmount.reverted ? ZERO : outstandingAmount.value
    let releasedAmountValue = releasedAmount.reverted ? ZERO : releasedAmount.value

    let currentOutstandingValue =  circulatingSupply.totalOutstandingValue.plus(outstandingAmountValue)
    let currentReleasedAmount = circulatingSupply.totalReleasedAmount.plus(releasedAmountValue)

    circulatingSupply.totalOutstandingValue = currentOutstandingValue
    circulatingSupply.totalReleasedAmount = currentReleasedAmount

    let currentCirculatingSupply = circulatingSupply.circulatingSupply.minus(circulatingSupply.totalOutstandingValue)

    circulatingSupply.circulatingSupply = currentCirculatingSupply
  
  }
  circulatingSupply.save()
}