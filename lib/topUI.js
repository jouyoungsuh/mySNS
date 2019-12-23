module.exports = {
    checkUser:function(req, res) {
        if (req.user) return true;
        else return false;
    },
    status:function(req, res) {
        var topUIstatus = 
        `
        <style>
        .button {
            -webkit-appearance: button;
            -moz-appearance: button;
            appearance: button;
        
            text-decoration: none;
            color: initial;
            padding: 20px 34px

        }
        </style>
        <div class="button" style = "text-align: center; font-size: 40px;",>
            <a href="/">mySNS</a>   
            <span style="float:right; font-size: 20px">
                <a href="/auth/login">login</a>  <a href="/auth/register">Register</a> &nbsp &nbsp &nbsp 
            </span>
        </div>
        `;
        if (this.checkUser(req, res)) {
            topUIstatus = 
            `
            <style>
            .button {
                -webkit-appearance: button;
                -moz-appearance: button;
                appearance: button;
            
                text-decoration: none;
                color: initial;
                padding: 20px 34px

            }
            </style>
            <div class="button" style = "text-align: center; font-size: 40px;",>
                <a href="/">mySNS</a>   
                <span style="float:right; font-size: 20px">
                    ${req.user.nickname}  <a href="/auth/logout">logout</a> &nbsp &nbsp &nbsp 
                </span>
            </div>
            `;
        }
        return topUIstatus;
    }
}
