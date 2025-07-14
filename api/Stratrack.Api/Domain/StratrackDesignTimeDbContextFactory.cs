using System;
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
        if (!string.IsNullOrEmpty(connectionString))
        {
            optionsBuilder.UseSqlServer(connectionString);
        }
        else if (OperatingSystem.IsWindows())
        {
            optionsBuilder.UseSqlServer("Data Source=(localdb)\\MSSQLLocalDB;Initial Catalog=StratrackDb;Integrated Security=True;Trust Server Certificate=True");
        }
        else
        {
            optionsBuilder.UseSqlite("Data Source=design.db");
        }

        return new StratrackDbContext(optionsBuilder.Options);
    }
}
