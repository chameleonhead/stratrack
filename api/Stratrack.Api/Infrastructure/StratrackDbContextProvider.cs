using EventFlow.EntityFramework;
using Microsoft.EntityFrameworkCore;
using Stratrack.Api.Domain;

namespace Stratrack.Api.Infrastructure;

public class StratrackDbContextProvider : IDbContextProvider<StratrackDbContext>, IDisposable
{
    private readonly DbContextOptions<StratrackDbContext> _options;

    public StratrackDbContextProvider()
    {
        var msSqlConnectionString = Environment.GetEnvironmentVariable("ConnectionStrings:StratrackDb");
        if (string.IsNullOrEmpty(msSqlConnectionString))
        {
            _options = new DbContextOptionsBuilder<StratrackDbContext>()
                .UseInMemoryDatabase("StratrackDb")
                .Options;
        }
        else
        {
            _options = new DbContextOptionsBuilder<StratrackDbContext>()
                .UseSqlServer(msSqlConnectionString)
                .Options;
        }
    }

    public StratrackDbContext CreateContext()
    {
        var context = new StratrackDbContext(_options);
        context.Database.EnsureCreated();
        return context;
    }

    public void Dispose()
    {
    }
}