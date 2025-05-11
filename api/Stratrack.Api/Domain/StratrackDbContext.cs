using EventFlow.EntityFramework.Extensions;
using Microsoft.EntityFrameworkCore;
using Stratrack.Api.Domain.Strategies;
using System.Text.Json;

namespace Stratrack.Api.Domain;

public class StratrackDbContext : DbContext
{
    public StratrackDbContext(DbContextOptions<StratrackDbContext> options)
        : base(options)
    {
    }

    public DbSet<StrategyReadModel> Strategies { get; set; }
    public DbSet<StrategyVersionReadModel> StrategyVersions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.AddEventFlowEvents();
        modelBuilder.AddEventFlowSnapshots();
        modelBuilder.Entity<StrategyReadModel>(entity =>
        {
            entity.Property(m => m.Template).HasConversion(
                v => JsonSerializer.Serialize(v, new JsonSerializerOptions { WriteIndented = false }),
                v => JsonSerializer.Deserialize<Dictionary<string, object>>(v, new JsonSerializerOptions { PropertyNameCaseInsensitive = true })!
            );
            entity.HasKey(m => m.Id);
        });
        modelBuilder.Entity<StrategyVersionReadModel>(entity =>
        {
            entity.Property(m => m.Template).HasConversion(
                v => JsonSerializer.Serialize(v, new JsonSerializerOptions { WriteIndented = false }),
                v => JsonSerializer.Deserialize<Dictionary<string, object>>(v, new JsonSerializerOptions { PropertyNameCaseInsensitive = true })!
            );
            entity.HasKey(m => m.Id);
        });
    }
}