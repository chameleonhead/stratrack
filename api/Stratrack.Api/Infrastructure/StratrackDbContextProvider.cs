using EventFlow.EntityFramework;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.DependencyInjection;
using Stratrack.Api.Domain;

namespace Stratrack.Api.Infrastructure;

public class StratrackDbContextProvider : IDbContextProvider<StratrackDbContext>, IDisposable
{
    private readonly DbContextOptions<StratrackDbContext> _options;

    public StratrackDbContextProvider(IServiceProvider service)
    {
        var msSqlConnectionString = Environment.GetEnvironmentVariable("ConnectionStrings:SqlConnectionString");
        if (string.IsNullOrEmpty(msSqlConnectionString))
        {
            msSqlConnectionString = Environment.GetEnvironmentVariable("SQLAZURECONNSTR_SqlConnectionString");
        }
        if (string.IsNullOrEmpty(msSqlConnectionString))
        {
            var root = service.GetRequiredService<InMemoryDatabaseRoot>();
            _options = new DbContextOptionsBuilder<StratrackDbContext>()
                .UseInMemoryDatabase("StratrackDb", root)
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