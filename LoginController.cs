using BPMCommonAPI.App_Code.Login;
using eAppsMobileCore.JwtPackages;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NuGet.Protocol;
using System.Text;
using UniversalSharingDll.Models;
using UniversalSharingDll.UniversalLib;
using UniversalSharingDll.UniversalLib.Defense;
using UniversalSharingDll.UniversalLib.Process.Login;
using UniversalSharingDll.UniversalLib.Process.Universal;

namespace eAppsMobileCore.Controllers.UniversalSharingCon.Login
{
    [AllowAnonymous]
    [Produces("application/json")]
    [Route("api/Login")]

    public class LoginController : Controller
    {
        CallMsgObj mCallMsgObj = new CallMsgObj();


        private CallMsgObj login(LoginInfo model)
        {
            LoginLib mLoginLib = new LoginLib();

            

            try
            {
                if (string.IsNullOrEmpty(model.LoginID) || string.IsNullOrEmpty(model.Password))
                {
                    mCallMsgObj.status = false;
                    mCallMsgObj.Obj_1 = EnglishEleaveMessageModel.Exception;
                    return mCallMsgObj;
                }


                if (!string.IsNullOrEmpty(model.LoginID))
                {
                    if (model.LoginID.Length > 30)
                    {
                        mCallMsgObj.status = false;
                        mCallMsgObj.Obj_1 = EnglishEleaveMessageModel.Exception;
                        return mCallMsgObj;
                    }
                }
                if (!string.IsNullOrEmpty(model.Password))
                {
                    if (model.Password.Length > 100)
                    {
                        mCallMsgObj.status = false;
                        mCallMsgObj.Obj_1 = EnglishEleaveMessageModel.Exception;
                        return mCallMsgObj;
                    }
                }
                if (!string.IsNullOrEmpty(model.DeviceType))
                {
                    if (model.DeviceType.Length > 30)
                    {
                        mCallMsgObj.status = false;
                        mCallMsgObj.Obj_1 = EnglishEleaveMessageModel.Exception;
                        return mCallMsgObj;
                    }
                }

                if (!string.IsNullOrEmpty(model.BrowserName))
                {
                    if (model.BrowserName.Length > 20)
                    {
                        mCallMsgObj.status = false;
                        mCallMsgObj.Obj_1 = EnglishEleaveMessageModel.Exception;
                        return mCallMsgObj;
                    }
                }
                if (!string.IsNullOrEmpty(model.BrowserVersion))
                {
                    if (model.BrowserVersion.Length > 50)
                    {
                        mCallMsgObj.status = false;
                        mCallMsgObj.Obj_1 = EnglishEleaveMessageModel.Exception;
                        return mCallMsgObj;
                    }
                }
                string password = model.Password;
                password = LoginPin.DecodeBase64(Encoding.UTF8, password);
                password = password.TrimStart(' ');
                password = password.TrimEnd(' ');

                ParameterDefense.IsDefenseParameter(ControllerContext.ActionDescriptor.ActionName,
                    [model.LoginID.Trim(), model.DeviceType, model.BrowserName, model.BrowserVersion]);
                SqlInjectionDefense.IsSqlInjection(ControllerContext.ActionDescriptor.ActionName,
                    [model.LoginID.Trim(), model.DeviceType, model.BrowserName, model.BrowserVersion]);



               

                mCallMsgObj = mLoginLib.LoginAction(model.LoginID.Trim(), password, model.DeviceType, model.BrowserName, model.BrowserVersion);

                if (mCallMsgObj.status && mCallMsgObj.Obj_1 != null && mCallMsgObj.Obj_1.ToString() == "NO_WEBALLOW")
                {
                    return mCallMsgObj;
                }

                if (mCallMsgObj.status)
                {
                    //[Tester log]
                    CoreLog.InsertLog(model.LoginID, "PWA api/Login  GetJwtToken start ", ConnectionStr.eLeave_dbLog);
                    if (MatchRegular.IsFormat(model.LoginID))
                    {
                        string EmployeeNum = Convert.ToString(model.LoginID.Split("\\".ToCharArray())[1]);
                        string JwtToken = JwtHelper.GetJwtToken(EmployeeNum);
                        if (!string.IsNullOrEmpty(JwtToken))
                        {
                            mCallMsgObj.Obj_18 = JwtToken;
                        }
                        else
                        {
                            mCallMsgObj.Obj_18 = string.Empty;
                        }
                    }
                    else
                    {
                        string JwtToken = JwtHelper.GetJwtToken(model.LoginID);
                        if (!string.IsNullOrEmpty(JwtToken))
                        {
                            mCallMsgObj.Obj_18 = JwtToken;
                        }
                        else
                        {
                            mCallMsgObj.Obj_18 = string.Empty;
                        }
                    }
                    //[Tester log]
                    CoreLog.InsertLog(model.LoginID, "PWA api/Login  GetJwtToken end ", ConnectionStr.eLeave_dbLog);
                }
                //[Tester log]
                //CoreLog.InsertLog(model.LoginID, "PWA api/Login  end ", ConnectionStr.eLeave_dbLog);
                return mCallMsgObj;

            }
            catch (Exception ex)
            {

                CoreLog.InsertLog(model.LoginID.Trim(), "Login error,please try again.", ex, ConnectionStr.eLeave_dbLog);
                mCallMsgObj.ClearObj();
                mCallMsgObj.status = false;
                mCallMsgObj.Obj_1 = EnglishEleaveMessageModel.Exception;
                return mCallMsgObj;
            }
        }


        [HttpPost]

        public CallMsgObj Post([FromBody] LoginInfo model)
        {
            return login(model);
        }

        //[HttpGet]
        //public string Get()
        //{
        //    return "value";
        //}
    }
}
