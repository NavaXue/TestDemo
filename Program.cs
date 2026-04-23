using eAppsMobileCore.StartHelp;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Polly;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Diagnostics;
using System.Net;
using System.Reflection;
using System.Security.Claims;
using System.Text;
using UniversalSharingDll.Models;
using UniversalSharingDll.UniversalLib;
using UniversalSharingDll.UniversalLib.Process.Universal;
using UniversalSharingDll.UniversalLib.StackExchangeRedis;

var builder = WebApplication.CreateBuilder(args);

LogFileHelp.WriteFile("==============================================");
LogFileHelp.WriteFile("Program start...");

string configValue = null;
var retryPolicy = Policy
    .Handle<Exception>()
    .WaitAndRetryAsync(
        retryCount: 1000,
        sleepDurationProvider: retryAttempt => TimeSpan.FromSeconds(retryAttempt += 30),
        onRetry: (exception, timeSpan, retryCount, context) =>
        {
            LogFileHelp.WriteFile($"try again, {retryCount}: {exception.Message}");
        });
try
{
    await retryPolicy.ExecuteAsync(async () =>
    {
        configValue = await InitializeAsync(); 
    });

    LogFileHelp.WriteFile("Setting ok！");
}
catch (Exception ex)
{
    LogFileHelp.WriteFile($"all try again ,failed: {ex.Message}");
    throw;
}
async Task<string> InitializeAsync()
{

    await Task.Delay(100);
    try
    {
        ThreadPool.SetMinThreads(50, 50);
        ThreadPool.GetMaxThreads(out int maxWorkerThreads, out int maxCompletionPortThreads);
        LogFileHelp.WriteFile("maxWorkerThreads:" + maxWorkerThreads + " IO maxCompletionPortThreads:" + maxCompletionPortThreads);
        ThreadPool.GetMinThreads(out int minWorkerThreads, out int minCompletionPortThreads);
        LogFileHelp.WriteFile("minWorkerThreads:" + minWorkerThreads + " IO minCompletionPortThreads:" + minCompletionPortThreads);
        Process currentProcess = Process.GetCurrentProcess();
        int pid = currentProcess.Id;
        LogFileHelp.WriteFile("Current Process ID: " + pid);

        ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;

        Appsettings.Sets();
        CommonKeys.Sets();

        //cancel push notification
        /*
        Appsettings.SetFCMServerAccount();
        Appsettings.SetHMSserverAccount();
        */
        UniversalLib.setEnglishMessage();

        RedisHelper mRedisHelper = new RedisHelper();
        mRedisHelper.InitConnect();
        LogFileHelp.WriteFile("Program loading data is complete.");

    }
    catch (Exception ex)
    {
        LogFileHelp.WriteFile("Program Exception:" + ex.Message + ex.StackTrace);
        throw;
    }
    return "InitializeAsync ok.";
}


LogFileHelp.WriteFile("Program in progess.");

//Swagger
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
//builder.Services.AddSwaggerGen();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("login", new OpenApiInfo
    {
        Title = "Login API",
        Version = "v1",
        Description = "RWG Community App"
    });
    options.SwaggerDoc("totpauthncon", new OpenApiInfo
    {
        Title = "MFA API (RWG Community)",
        Version = "v1",
        Description = "RWG Community App"
    });
    options.SwaggerDoc("eleavecon", new OpenApiInfo
    {
        Title = "Leave API",
        Version = "v1",
        Description = "RWG Community App"
    });
    options.SwaggerDoc("emessagecon", new OpenApiInfo
    {
        Title = "Communique API",
        Version = "v1",
        Description = "RWG Community App"
    });
    options.SwaggerDoc("epayslipcon", new OpenApiInfo
    {
        Title = "PaySlip API",
        Version = "v1",
        Description = "RWG Community App"
    });
    options.SwaggerDoc("eppmcon", new OpenApiInfo
    {
        Title = "Profile API",
        Version = "v1",
        Description = "RWG Community App"
    });
    options.SwaggerDoc("erostercom", new OpenApiInfo
    {
        Title = "Roster API",
        Version = "v1",
        Description = "RWG Community App"
    });
    options.SwaggerDoc("ihostelcon", new OpenApiInfo
    {
        Title = "Hostel API",
        Version = "v1",
        Description = "RWG Community App"
    });
    options.SwaggerDoc("instantmessagecon", new OpenApiInfo
    {
        Title = "iMessage API",
        Version = "v1",
        Description = "RWG Community App"
    });
    options.SwaggerDoc("itrainingcon", new OpenApiInfo
    {
        Title = "iTraining API",
        Version = "v1",
        Description = "RWG Community App"
    });
    options.SwaggerDoc("businesscardcon", new OpenApiInfo
    {
        Title = "BusinessCard API",
        Version = "v1",
        Description = "RWG Community App"
    });






    options.DocInclusionPredicate((docName, apiDesc) =>
    {
        if (!apiDesc.TryGetMethodInfo(out MethodInfo methodInfo)) return false;


        var controllerNamespace = methodInfo.DeclaringType?.Namespace;


        return controllerNamespace?.ToLower().Contains($"{docName}") == true;
    });

    //options.SchemaGeneratorOptions.SchemaIdSelector = type => type.FullName;
    options.SchemaGeneratorOptions.SchemaIdSelector = type =>
    {
        if (type.IsNested || type.IsNotPublic)
        {
            return $"Internal_{type.Name}";
        }
        return type.Name;
    };

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });


    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                },
                Scheme = "oauth2",
                Name = "Bearer",
                In = ParameterLocation.Header,
            },
            new List<string>()
        }
    });
});
//---------


builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(
    options =>
    {
        var secretByte = Encoding.UTF8.GetBytes(JwtModel.JWT_SecretKey);
        options.TokenValidationParameters = new TokenValidationParameters()
        {

            ValidateIssuer = true,
            ValidIssuer = JwtModel.JWT_Issuer,

            ValidateAudience = true,
            ValidAudience = JwtModel.JWT_Audience,

            ValidateLifetime = true,

            IssuerSigningKey = new SymmetricSecurityKey(secretByte),

            // 声明映射配置
            NameClaimType = ClaimTypes.NameIdentifier,
            RoleClaimType = ClaimTypes.Role,

            // 自定义验证
            ClockSkew = TimeSpan.Zero
        };

    }
);

builder.Services.AddCors(options =>
    {
        options.AddPolicy("any",
        builder =>
        {
            builder.WithOrigins();
        });
    }
);



builder.Services.AddControllersWithViews();


builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    string msg = string.Empty;
    options.InvalidModelStateResponseFactory = (context) =>
    {
        foreach (var key in context.ModelState.Keys)
        {
            var errors = context.ModelState[key].Errors;
            if (errors.Count() > 0)
            {
                msg = errors[0].ErrorMessage;
                break;
            }
        }
        return new JsonResult(EnglishEleaveMessageModel.Exception);
    };
});




var app = builder.Build();


if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home");

    app.UseHsts();
}

app.UseStaticFiles();

app.UseRouting();



//[TESTER] Swagger
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/CommuntiyApiNet8/swagger/login/swagger.json", "Login API");
        c.SwaggerEndpoint("/CommuntiyApiNet8/swagger/totpauthncon/swagger.json", "MFA API (RWG Community)");
        c.SwaggerEndpoint("/CommuntiyApiNet8/swagger/eleavecon/swagger.json", "Leave API");
        c.SwaggerEndpoint("/CommuntiyApiNet8/swagger/emessagecon/swagger.json", "Communique API");
        c.SwaggerEndpoint("/CommuntiyApiNet8/swagger/epayslipcon/swagger.json", "PaySlip API");
        c.SwaggerEndpoint("/CommuntiyApiNet8/swagger/eppmcon/swagger.json", "Profile API");
        c.SwaggerEndpoint("/CommuntiyApiNet8/swagger/erostercom/swagger.json", "Roster API");
        c.SwaggerEndpoint("/CommuntiyApiNet8/swagger/ihostelcon/swagger.json", "Hostel API");
        c.SwaggerEndpoint("/CommuntiyApiNet8/swagger/instantmessagecon/swagger.json", "iMessage API");
        c.SwaggerEndpoint("/CommuntiyApiNet8/swagger/itrainingcon/swagger.json", "iTraining API");
        c.SwaggerEndpoint("/CommuntiyApiNet8/swagger/businesscardcon/swagger.json", "BusinessCard API");



        /*
        c.SwaggerEndpoint("/swagger/login/swagger.json", "Login API");
        c.SwaggerEndpoint("/swagger/totpauthncon/swagger.json", "MFA API (RWG Community)");
        c.SwaggerEndpoint("/swagger/eleavecon/swagger.json", "Leave API");
        c.SwaggerEndpoint("/swagger/emessagecon/swagger.json", "Communique API");
        c.SwaggerEndpoint("/swagger/epayslipcon/swagger.json", "PaySlip API");
        c.SwaggerEndpoint("/swagger/eppmcon/swagger.json", "Profile API");
        c.SwaggerEndpoint("/swagger/erostercom/swagger.json", "Roster API");
        c.SwaggerEndpoint("/swagger/ihostelcon/swagger.json", "Hostel API");
        c.SwaggerEndpoint("/swagger/instantmessagecon/swagger.json", "iMessage API");
        c.SwaggerEndpoint("/swagger/itrainingcon/swagger.json", "iTraining API");
        c.SwaggerEndpoint("/swagger/businesscardcon/swagger.json", "BusinessCard API");

        */
    });
}
//-----



app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.UseMiddleware<RestrictGetRequestsMiddleware>();

app.Run();
