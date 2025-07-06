using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Stratrack.Api.Domain;

public class StratrackDesignTimeDbContextFactory : IDesignTimeDbContextFactory<StratrackDbContext>
{
    public StratrackDbContext CreateDbContext(string[] args)
    {
        var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings:SqlConnectionString");
        if (string.IsNullOrEmpty(connectionString))
        {
            connectionString = Environment.GetEnvironmentVariable("SQLAZURECONNSTR_SqlConnectionString");
        }

        var optionsBuilder = new DbContextOptionsBuilder<StratrackDbContext>();
        if (string.IsNullOrEmpty(connectionString))
        {
            optionsBuilder.UseInMemoryDatabase("StratrackDb");
        }
        else
        {
            optionsBuilder.UseSqlServer(connectionString);
        }

        return new StratrackDbContext(optionsBuilder.Options);
    }
}
