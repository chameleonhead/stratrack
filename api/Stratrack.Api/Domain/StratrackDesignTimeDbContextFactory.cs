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
        if (string.IsNullOrEmpty(connectionString))
        {
            connectionString = "Data Source=(localdb)\\MSSQLLocalDB;Initial Catalog=StratrackDb;Integrated Security=True;Trust Server Certificate=True";
        }

        var optionsBuilder = new DbContextOptionsBuilder<StratrackDbContext>();
        optionsBuilder.UseSqlServer(connectionString);

        return new StratrackDbContext(optionsBuilder.Options);
    }
}
