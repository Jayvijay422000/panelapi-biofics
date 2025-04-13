// scripts/updateFinalGeneratedGas.js

const { DigesterData } = require('../models');

async function updateFinalGeneratedGas() {
    try {
        const digesterData = await DigesterData.findAll({
            order: [['digester_id', 'ASC'], ['timestamp', 'ASC']],
        });

        for (let i = 1; i < digesterData.length; i++) {
            const previous = digesterData[i - 1];
            const current = digesterData[i];

            if (current.digester_id === previous.digester_id) {
                current.final_generated_gas = Math.abs(current.generated_gas - previous.generated_gas);
                await current.save();
            }
        }

        console.log('Final generated gas values updated successfully.');
    } catch (error) {
        console.error('Error updating final generated gas values:', error);
    }
}

updateFinalGeneratedGas();
