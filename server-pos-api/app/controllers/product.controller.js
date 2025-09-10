const BaseController = require("./base.controller");
const { PrismaClient } = require('@prisma/client');

class ProductController extends BaseController {
    constructor() {
        super();
        this.prisma = new PrismaClient();
    }
    
}

module.exports = ProductController;