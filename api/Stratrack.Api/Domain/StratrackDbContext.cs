using EventFlow.EntityFramework.Extensions;
using Microsoft.EntityFrameworkCore;
using Stratrack.Api.Domain.DataSources;
using Stratrack.Api.Domain.Strategies;
using Stratrack.Api.Domain.Dukascopy;
using Stratrack.Api.Domain.Blobs;

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
    public DbSet<DukascopyJobReadModel> DukascopyJobs { get; set; }
    public DbSet<DukascopyJobExecutionReadModel> DukascopyJobExecutions { get; set; }
    public DbSet<DukascopyJobStepReadModel> DukascopyJobSteps { get; set; }
    public DbSet<DataChunkReadModel> DataChunks { get; set; }
    public DbSet<BlobData> Blobs { get; set; }

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
        modelBuilder.Entity<DukascopyJobReadModel>(entity =>
        {
            entity.HasKey(m => m.Id);
        });
        modelBuilder.Entity<DukascopyJobExecutionReadModel>(entity =>
        {
            entity.HasKey(m => m.ExecutionId);
        });
        modelBuilder.Entity<DukascopyJobStepReadModel>(entity =>
        {
            entity.HasKey(m => m.Id);
        });
        modelBuilder.Entity<DataChunkReadModel>(entity =>
        {
            entity.HasKey(m => m.Id);
        });
        modelBuilder.Entity<BlobData>(entity =>
        {
            entity.HasKey(b => b.Id);
        });
    }
}
