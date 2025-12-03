const Joi = require("joi");

const createReviewSchema = Joi.object({
    projectCode: Joi.string().required().messages({
        "any.required": "Project code is required",
    }),
    rating: Joi.number().integer().min(1).max(5).required().messages({
        "number.min": "Rating must be at least 1",
        "number.max": "Rating must be at most 5",
        "any.required": "Rating is required",
    }),
    comment: Joi.string().max(1000).optional().allow(""),
    photos: Joi.array().items(Joi.string().uri()).optional().messages({
        "string.uri": "Photo must be a valid URL",
    }),
});

module.exports = {
    validateCreateReview: (data) => createReviewSchema.validate(data),
};
