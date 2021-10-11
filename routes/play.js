const express = require("express");
const router = express.Router();
const { Chess } = require("chess.js");
const { ensureAuthenticated } = require('../config/auth');

router.get("/computer",ensureAuthenticated,(req, res) => {
    res.render("play_computer.ejs");
});
router.get("/",ensureAuthenticated,(req, res) => {
    res.render("play_human.ejs",{
        name: req.user.name,
        email: req.user.email
      });
});
module.exports = router;
