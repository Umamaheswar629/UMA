using System.Security.Claims;
using Domain.Enmus;

using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public abstract class BaseApiController : ControllerBase
{
    protected int GetUserId()
    {
        var claim = User.FindFirst("userId") ?? User.FindFirst(ClaimTypes.NameIdentifier);
        return int.Parse(claim!.Value);
    }

    protected UserRole GetUserRole()
    {
        var roleClaim = User.FindFirst(ClaimTypes.Role);
        return Enum.Parse<UserRole>(roleClaim!.Value);
    }
}