using EventFlow.EntityFramework.Extensions;
using Microsoft.EntityFrameworkCore;
using Stratrack.Api.Domain.DataSources;
using Stratrack.Api.Domain.Strategies;

namespace Stratrack.Api.Domain;

public class StratrackDbContext : DbContext
{
    public StratrackDbContext(DbContextOptions<StratrackDbContext> options)
        : base(options)
    {
    }

    public DbSet<StrategyReadModel> Strategies { get; set; }
    public DbSet<StrategyVersionReadModel> StrategyVersions { get; set; }

    public DbSet<DataSourceReadModel> DataSources { get; set; }
    public DbSet<DataChunkEntity> DataChunks { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.AddEventFlowEvents();
        modelBuilder.AddEventFlowSnapshots();
        modelBuilder.Entity<StrategyReadModel>(entity =>
        {
            entity.HasKey(m => m.Id);
        });
        modelBuilder.Entity<StrategyVersionReadModel>(entity =>
        {
            entity.HasKey(m => m.Id);
        });
    }
}