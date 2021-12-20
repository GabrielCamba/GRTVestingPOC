import { GraphCirculatingSupply } from '../../generated/schema'
import { BigInt } from '@graphprotocol/graph-ts'

export function createOrLoadGraphCirculatingSupply(): GraphCirculatingSupply {
    let graphCirculatingSupply = GraphCirculatingSupply.load('0')
    if (graphCirculatingSupply == null) {
        graphCirculatingSupply = new GraphCirculatingSupply('0')
        graphCirculatingSupply.totalSupply = BigInt.fromI32(0)
        graphCirculatingSupply.circulatingSupply = BigInt.fromI32(0)
        graphCirculatingSupply.dynamicContracts = []
        graphCirculatingSupply.blockHeight = BigInt.fromI32(0)

        graphCirculatingSupply.save()
    }
    return graphCirculatingSupply as GraphCirculatingSupply
}