module.exports = {
    // Fix for "Stack too deep" error in "hardhat coverage"
    // Enable minimum yul optimization 
    // https://github.com/sc-forks/solidity-coverage/blob/89882a211e9f69ed6b1afc99b2bb9d56b857e686/docs/faq.md?plain=1#L85
    configureYulOptimizer: true,
    solcOptimizerDetails:  {
        peephole: false,
        inliner: false,
        jumpdestRemover: false,
        orderLiterals: true,
        deduplicate: false,
        cse: false,
        constantOptimizer: false,
        yul: false
    }
};