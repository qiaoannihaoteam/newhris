<%--

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Purpose      : 登录

 * Date         : 03 Sep 2016
 * Author       : Max Chen (ISD/CSC)
 * Note         :
 * -------------------------------------------------
 * 03 Sep 2016      Max Chen (ISD/CSC)        the first version
 * 05 Jul 2017      Max Chen (ISD/CSC)        新增等待登录动画
 *
 *      the latest update: 05 Jul 2017 14:00:00
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/

--%>

<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Login.aspx.cs" Inherits="HRIS424.Web.Login" %>

<!DOCTYPE html>
<html>

    <head id="Head1" runat="server">
        <title>Please Login...</title>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
        <meta name="viewport" content="width=device-width, user-scalable=no" />
        <link href="http://cdn.crystal.local/assets/bootstrap/bootstrap-3.3.7-dist/css/bootstrap.min.css" rel="stylesheet" type="text/css"
        />
        <link href="http://cdn.crystal.local/assets/kendo/2016.3.1028/styles/kendo.common-bootstrap.min.css" rel="stylesheet" type="text/css"
        />
        <link href="http://cdn.crystal.local/assets/kendo/2016.3.1028/styles/kendo.bootstrap.min.css" rel="stylesheet" type="text/css"
        />
        <link href="Css/CommonStyle.css" rel="Stylesheet" type="text/css" />
        <style>
            body {
                background: url("./Images/Login/Loginpagebgright.png");
                text-align: center;
                margin: 0 auto;
                font-size: 14px;
                overflow: hidden;
                color: #fff;
            }

            .slogon {
                left: 20px;
                width: 60%;
                height: 40px;
                min-width: 888px;
            }

            .bgimg {
                position: absolute;
                left: 0;
                top: 0;
                z-index: -1;
            }

            #content {
                width: 800px;
                margin: 0 auto;
                margin-top: 340px;
                text-align: center;
            }

            #content form {
                padding: 0 20px;
                width: 60%;
                float: left;
                border-left: white solid 1px;
            }

            .logo {
                width: 30%;
                float: left;
                margin-top: 33px;
                display: block;
            }

            .logo img {
                width: 160px;
            }

            .form-group {
                height: 30px;
            }

            .form-group label,
            .form-group input,
            .form-group button,
            .form-group .k-widget {
                float: left;
            }

            .form-group input,
            .form-group button,
            .form-group select,
            .form-group .k-widget {
                width: 70%;
            }

            .form-group label {
                display: block;
                width: 120px;
                padding: 0 20px;
                text-align: right;
                line-height: 35px;
            }

            .form-group .k-widget .k-icon {
                margin-top: 7px;
            }

            .close {
                margin: 5px 10px;
            }

            .bg-danger {
                display: none;
                margin: -17px 110px 10px 40px;
                line-height: 28px;
                background-color: #ffe0d9;
                color: #d92800;
                border-color: #ffb6a6;
                border-radius: 4px;
                height: 30px;
            }

            @media only screen and (max-width: 480px) {
                /* styles for mobile browsers > 480px; */
                .logo {
                    display: none;
                }
                .form-group input,
                .form-group button,
                .form-group select,
                .form-group .k-widget {
                    width: 200px;
                }
            }

            .background {
                display: block;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.4);
                position: absolute;
                top: 0;
                left: 0;
                z-index: 2000;
            }

            .progressBar {
                color: black;
                border: solid 2px #86A5AD;
                background: #FFF url(http://cdn.crystal.local/assets/dwz/themes/default/images/progressBar/progressBar_m.gif) no-repeat 10px 10px;
                display: block;
                width: 148px;
                top: 40%;
                left: 50%;
                padding: 10px 10px 10px 50px;
                text-align: left;
                line-height: 27px;
                font-weight: bold;
                position: absolute;
                z-index: 2001;
                font-size: 12px;
            }
        </style>
    </head>

    <body>
        <img alt="slogon" class="slogon" style="position: absolute; z-index: 99; top: 256px;" src="./Images/Login/Slogan.png" />
        <img alt="backgroup image" class="bgimg" src="./Images/Login/Loginpagebg01.png" />
        <div id="content">
            <p class="bg-danger">
                <button type="button" class="close">
                    <span aria-hidden="true">&times;</span>
                    <span class="sr-only">Close</span>
                </button>
            </p>
            <div class="logo">
                <img alt="logo" src="Images/crystalLogo.png" />
                <h3 id="title" lang="CN:标准模版~EN:Standard Template">
                </h3>
            </div>
            <form id="Form1" role="form" method="post" action="Login.aspx">
                <div class="form-group">
                    <label id="lblDomain" for="inputDomain" class="control-label" lang="CN:域~EN:Domain">
                    </label>
                    <div class="">
                        <select class="form-control" id="inputDomain" name="domain">
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label id="lblUser" for="inputUser" class="control-label" lang="CN:用户ID~EN:User ID">
                    </label>
                    <div class="">
                        <input class="form-control" id="inputUser" placeholder="User Name" name="user" />
                    </div>
                </div>
                <div class="form-group">
                    <label id="lblpassword" for="inputPassword" class="control-label" lang="CN:密码~EN:Password">
                    </label>
                    <div class="">
                        <input type="password" class="form-control" id="inputPassword" placeholder="Password" name="password" />
                    </div>
                </div>
                <div class="form-group">
                    <label id="lblLanguage" for="inputLanguage" class="control-label" lang="CN:语言~EN:Language">
                    </label>
                    <div class="">
                        <select class="form-control" id="inputLanguage" placeholder="Language" name="language">
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label class="control-label">
                    </label>
                    <div>
                        <button id="btnSignIn" type="submit" class="btn btn-success" lang="CN:登陆~EN:Sign in">
                        </button>
                    </div>
                </div>
            </form>
        </div>
        <!--语言XML-->
        <div id="LangXML">
            <%=LangXML %>
        </div>
        <!--Progress Bar-->
        <div id="background" class="background" style="display: none;">
            <div id="progressBar" class="progressBar" style="display: none;">
                Loading....</div>
        </div>
        <script type="text/javascript" src="http://cdn.crystal.local/assets/jquery/jquery-1.9.0.min.js"></script>
        <script type="text/javascript" src="http://cdn.crystal.local/assets/kendo/2016.3.1028/js/kendo.all.min.js" defer="defer"></script>
        <script src="Controls/Language/language.js" type="text/javascript"></script>
        <!-- #include file="Js/extentions.js.inc" -->
        <script type="text/javascript" defer="defer">
            //全局变量--start-------
            var Debug = "<%=Debug%>";
            var LoginUserID = "<%=LoginUserID%>";
            var SysID = "<%=SysID %>"
            var FunctionID = "<%=FunctionID %>"
            var PageID = "<%=PageID%>";
            var FlashMessage = "<%=FlashMessage%>";
            var LangType = "<%=LangType%>";
            var Language = new Language("Controls/Language/Language.aspx", LangType);

            $(function () {
                $('#inputDomain').kendoDropDownList({
                    dataSource: {
                        data: ["CN", "HK", "OS"]
                    }
                });

                $('#inputLanguage').kendoDropDownList({
                    dataSource: {
                        data: ["EN", "CN"]
                    },
                    change: function () {
                        Language.LangType = this.value();
                        LangInit();
                    }
                });

                LangInit();

                $("form").find(".k-widget")[0].focus();

                $("form").on("submit", function () {
                    $("#background,#progressBar").show();
                });

                $("form").find(".k-widget, input, button").on("keypress", function (e) {
                    if (e.which === 13) {
                        var inputs = $("form").find(".k-widget, input, button"),
                            idx = inputs.index(this);
                        if (idx !== inputs.length - 1) {
                            inputs[idx + 1].focus();
                        }
                    }
                });

                $('.close').on('click', function () {
                    $('.bg-danger').fadeOut();
                });

                $('#inputLanguage').data('kendoDropDownList').value(LangType || "EN");

                if (FlashMessage.length > 0) {
                    $('.bg-danger').append(FlashMessage);
                    $('.bg-danger').show();
                }
            });
        </script>
    </body>

</html>