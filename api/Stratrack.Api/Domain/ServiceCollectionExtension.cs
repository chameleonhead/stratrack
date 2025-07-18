﻿using EventFlow.EntityFramework;
using EventFlow.EntityFramework.Extensions;
using EventFlow.Extensions;
using Microsoft.Extensions.DependencyInjection;
using Stratrack.Api.Domain.Blobs;
using Stratrack.Api.Domain.DataSources;
using Stratrack.Api.Domain.DataSources.Commands;
using Stratrack.Api.Domain.DataSources.Events;
using Stratrack.Api.Domain.DataSources.Queries;
using Stratrack.Api.Domain.Dukascopy;
using Stratrack.Api.Domain.Dukascopy.Commands;
using Stratrack.Api.Domain.Dukascopy.Events;
using Stratrack.Api.Domain.Dukascopy.Queries;
using Stratrack.Api.Domain.Strategies;
using Stratrack.Api.Domain.Strategies.Commands;
using Stratrack.Api.Domain.Strategies.Events;
using Stratrack.Api.Domain.Strategies.Queries;
using Stratrack.Api.Infrastructure;

namespace Stratrack.Api.Domain;

public static class ServiceCollectionExtension
{
    public static IServiceCollection AddStratrack<TDbContextProvider>(this IServiceCollection services)
        where TDbContextProvider : class, IDbContextProvider<StratrackDbContext>
    {
        return services.AddEventFlow(ef =>
        {
            ef.AddCommands(
                typeof(StrategyCreateCommand),
                typeof(StrategyUpdateCommand),
                typeof(StrategyDeleteCommand),
                typeof(DataSourceCreateCommand),
                typeof(DataSourceUpdateCommand),
                typeof(DataSourceDeleteCommand),
                typeof(DataSourceLockCommand),
                typeof(DataSourceUnlockCommand),
                typeof(DataChunkRegisterCommand),
                typeof(DataChunkDeleteCommand),
                typeof(DukascopyJobCreateCommand),
                typeof(DukascopyJobUpdateCommand),
                typeof(DukascopyJobEnableCommand),
                typeof(DukascopyJobDisableCommand),
                typeof(DukascopyJobDeleteCommand),
                typeof(DukascopyJobRecordFetchResultCommand),
                typeof(DukascopyJobExecutionStartCommand),
                typeof(DukascopyJobExecutionFinishCommand),
                typeof(DukascopyJobExecutionInterruptRequestCommand),
                typeof(DukascopyJobExecutionInterruptCommand)
            ).AddCommandHandlers(
                typeof(StrategyCreateCommandHandler),
                typeof(StrategyUpdateCommandHandler),
                typeof(StrategyDeleteCommandHandler),
                typeof(DataSourceCreateCommandHandler),
                typeof(DataSourceUpdateCommandHandler),
                typeof(DataSourceDeleteCommandHandler),
                typeof(DataSourceLockCommandHandler),
                typeof(DataSourceUnlockCommandHandler),
                typeof(DataChunkRegisterCommandHandler),
                typeof(DataChunkDeleteCommandHandler),
                typeof(DukascopyJobCreateCommandHandler),
                typeof(DukascopyJobUpdateCommandHandler),
                typeof(DukascopyJobEnableCommandHandler),
                typeof(DukascopyJobDisableCommandHandler),
                typeof(DukascopyJobDeleteCommandHandler),
                typeof(DukascopyJobRecordFetchResultCommandHandler),
                typeof(DukascopyJobExecutionStartCommandHandler),
                typeof(DukascopyJobExecutionFinishCommandHandler),
                typeof(DukascopyJobExecutionInterruptRequestCommandHandler),
                typeof(DukascopyJobExecutionInterruptCommandHandler)
            ).AddEvents(
                typeof(StrategyCreatedEvent),
                typeof(StrategyUpdatedEvent),
                typeof(StrategyVersionAddedEvent),
                typeof(StrategyDeletedEvent),
                typeof(DataSourceCreatedEvent),
                typeof(DataSourceUpdatedEvent),
                typeof(DataSourceDeletedEvent),
                typeof(DataSourceLockedEvent),
                typeof(DataSourceUnlockedEvent),
                typeof(DataChunkRegisteredEvent),
                typeof(DataChunkDeletedEvent),
                typeof(DukascopyJobCreatedEvent),
                typeof(DukascopyJobUpdatedEvent),
                typeof(DukascopyJobEnabledEvent),
                typeof(DukascopyJobDisabledEvent),
                typeof(DukascopyJobDeletedEvent),
                typeof(DukascopyJobExecutedEvent),
                typeof(DukascopyJobExecutionStartedEvent),
                typeof(DukascopyJobExecutionFinishedEvent),
                typeof(DukascopyJobExecutionInterruptRequestedEvent),
                typeof(DukascopyJobExecutionInterruptedEvent)
            );

            ef.ConfigureEntityFramework(EntityFrameworkConfiguration.New);
            ef.UseEntityFrameworkEventStore<StratrackDbContext>();
            ef.AddDbContextProvider<StratrackDbContext, TDbContextProvider>();

            ef.UseEntityFrameworkReadModel<StrategyReadModel, StratrackDbContext>();
            ef.UseEntityFrameworkReadModel<StrategyVersionReadModel, StratrackDbContext, StrategyVersionReadModelLocator>();
            ef.RegisterServices(services => services.AddSingleton<StrategyVersionReadModelLocator>());
            ef.AddQueryHandlers(typeof(StrategyReadModelSearchQueryHandler));
            ef.AddQueryHandlers(typeof(StrategyVersionReadModelSearchQueryHandler));

            ef.UseEntityFrameworkReadModel<DataSourceReadModel, StratrackDbContext>();
            ef.UseEntityFrameworkReadModel<DataChunkReadModel, StratrackDbContext, DataChunkReadModelLocator>();
            ef.UseEntityFrameworkReadModel<DukascopyJobReadModel, StratrackDbContext>();
            ef.UseEntityFrameworkReadModel<DukascopyJobExecutionReadModel, StratrackDbContext, DukascopyJobExecutionReadModelLocator>();
            ef.UseEntityFrameworkReadModel<DukascopyJobFetchResultReadModel, StratrackDbContext, DukascopyJobFetchResultReadModelLocator>();
            ef.AddQueryHandlers(typeof(DataSourceReadModelSearchQueryHandler));
            ef.AddQueryHandlers(typeof(DataChunkReadModelSearchQueryHandler));
            ef.AddQueryHandlers(typeof(DukascopyJobReadModelSearchQueryHandler));
            ef.AddQueryHandlers(typeof(DukascopyJobExecutionReadModelSearchQueryHandler));
            ef.AddQueryHandlers(typeof(DukascopyJobFetchResultReadModelSearchQueryHandler));
            ef.AddQueryHandlers(typeof(DukascopyJobFetchResultReadModelGetExecutionSummaryQueryHandler));
            ef.AddQueryHandlers(typeof(DukascopyJobFetchResultPagedQueryHandler));
            ef.RegisterServices(s =>
            {
                s.AddSingleton<IBlobStorage, DatabaseBlobStorage>();
                s.AddSingleton<DataChunkReadModelLocator>();
                s.AddSingleton<DukascopyJobExecutionReadModelLocator>();
                s.AddSingleton<DukascopyJobFetchResultReadModelLocator>();
                s.AddSingleton<IDukascopyClient, DukascopyClient>();
                s.AddSingleton<DukascopyFetchService>();
                s.AddSingleton<CsvChunkService>();
            });
        });
    }
}
