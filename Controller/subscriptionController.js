const User = require('../Models/user');
const SubscriptionPlan = require('../Models/subscriptionPlan');

// Create a new subscription plan
const createSubscriptionPlan = async (req, res) => {
    const { name, price, duration } = req.body;
    
    try {
        const newPlan = await SubscriptionPlan.create({ name, price, duration });
        res.status(201).json(newPlan);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all subscription plans with pagination
const getAllSubscriptionPlans = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    try {
        const { count, rows } = await SubscriptionPlan.findAndCountAll({
            limit: parseInt(limit),
            offset: parseInt(offset),
        });
        res.status(200).json({
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            totalItems: count,
            plans: rows,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single subscription plan by ID
const getSubscriptionPlanById = async (req, res) => {
    const { id } = req.params;

    try {
        const plan = await SubscriptionPlan.findByPk(id);
        if (plan) {
            res.status(200).json(plan);
        } else {
            res.status(404).json({ message: 'Subscription plan not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a subscription plan by ID
const updateSubscriptionPlan = async (req, res) => {
    const { id } = req.params;
    const { name, price, duration } = req.body;

    try {
        const plan = await SubscriptionPlan.findByPk(id);
        if (plan) {
            plan.name = name;
            // plan.description = description;
            plan.price = price;
            plan.duration = duration;
            await plan.save();
            res.status(200).json(plan);
        } else {
            res.status(404).json({ message: 'Subscription plan not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a subscription plan by ID
const deleteSubscriptionPlan = async (req, res) => {
    const { id } = req.params;

    try {
        const plan = await SubscriptionPlan.findByPk(id);
        if (plan) {
            await plan.destroy();
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Subscription plan not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};





const activateSubscription = async (req, res) => {
    const { clientId, subscription_start, subscription_end } = req.body;
    const user = await User.findByPk(clientId);

    if (user) {
        user.subscription_status = 'active';
        user.subscription_start = new Date(subscription_start);
        user.subscription_end = new Date(subscription_end);

        await user.save();
        res.json({
            message: 'Subscription activated successfully.',
            subscription_start: user.subscription_start,
            subscription_end: user.subscription_end
        });
    } else {
        res.status(404).json({ message: 'Client not found.' });
    }
};

const deactivateSubscription = async (req, res) => {
    const { clientId } = req.body;
    const user = await User.findByPk(clientId);

    if (user) {
        user.subscription_status = 'inactive';
        await user.save();
        res.json({ message: 'Subscription deactivated successfully.' });
    } else {
        res.status(404).json({ message: 'Client not found.' });
    }
};

module.exports = {
    createSubscriptionPlan,
    getAllSubscriptionPlans,
    getSubscriptionPlanById,
    updateSubscriptionPlan,
    deleteSubscriptionPlan,
    activateSubscription,
    deactivateSubscription,
};

