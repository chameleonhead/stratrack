using Azure;
using EventFlow.Aggregates;
using EventFlow.ReadStores;
using Google.Protobuf.WellKnownTypes;
using Microsoft.CodeAnalysis;
using Stratrack.Api.Domain.Dukascopy.Events;
using System.ComponentModel.DataAnnotations;

namespace Stratrack.Api.Domain.Dukascopy;

public class DukascopyJobFetchResultReadModel : IReadModel,
    IAmReadModelFor<DukascopyJobAggregate, DukascopyJobId, DukascopyJobExecutedEvent>
{
    [Key]
    public string Id { get; set; } = string.Empty;
    public Guid JobId { get; set; }
    public DateTimeOffset TargetTime { get; set; }
    public string Symbol { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public int HttpStatus { get; set; }
    public string? ETag { get; set;  }
    public DateTimeOffset? LastModified { get; set; }
    public string? ErrorMessage { get; set;  }
    public double Duration { get; set;  }

    public Task ApplyAsync(IReadModelContext context, IDomainEvent<DukascopyJobAggregate, DukascopyJobId, DukascopyJobExecutedEvent> domainEvent, CancellationToken cancellationToken)
    {
        Id = context.ReadModelId;
        JobId = domainEvent.AggregateIdentity.GetGuid();
        TargetTime = domainEvent.AggregateEvent.TargetTime;
        Symbol = domainEvent.AggregateEvent.Symbol;
        FileUrl = domainEvent.AggregateEvent.FileUrl;
        HttpStatus = domainEvent.AggregateEvent.HttpStatus;
        ETag = domainEvent.AggregateEvent.ETag;
        LastModified = domainEvent.AggregateEvent.LastModified;
        return Task.CompletedTask;
    }
}
