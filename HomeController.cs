using eAppsMobileCore.Models;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;

namespace eAppsMobileCore.Controllers
{
    public class HomeController : Controller
    {
        

        public IActionResult Index()
        {
            return View();
        }

       
    }
}
