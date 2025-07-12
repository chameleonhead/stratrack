using EventFlow.EntityFramework;
using Microsoft.EntityFrameworkCore;
using Stratrack.Api.Domain;

namespace Stratrack.Api.Infrastructure;

public class StratrackDbContextProvider : IDbContextProvider<StratrackDbContext>, IDisposable
{
    private readonly DbContextOptions<StratrackDbContext> _options;

    public StratrackDbContextProvider()
    {
        var msSqlConnectionString = Environment.GetEnvironmentVariable("ConnectionStrings:SqlConnectionString");
        if (string.IsNullOrEmpty(msSqlConnectionString))
        {
            msSqlConnectionString = Environment.GetEnvironmentVariable("SQLAZURECONNSTR_SqlConnectionString");
        }
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
        if (context.Database.IsSqlServer())
        {
            context.Database.Migrate();
        }
        else
        {
            context.Database.EnsureCreated();
        }
        return context;
    }

    /// <summary>
    /// Create context without applying migrations. Used only for development
    /// scenarios such as resetting the database when migrations fail.
    /// </summary>
    public StratrackDbContext CreateContextWithoutInitialization()
    {
        return new StratrackDbContext(_options);
    }

    public void Dispose()
    {
    }
}