using EventFlow.EntityFramework;
using EventFlow.EntityFramework.Extensions;
using EventFlow.Extensions;
using Microsoft.Extensions.DependencyInjection;
using Stratrack.Api.Domain.DataSources;
using Stratrack.Api.Domain.DataSources.Commands;
using Stratrack.Api.Domain.DataSources.Events;
using Stratrack.Api.Domain.DataSources.Queries;
using Stratrack.Api.Domain.Blobs;
using Stratrack.Api.Infrastructure;
using Stratrack.Api.Domain.Dukascopy;
using Stratrack.Api.Domain.Dukascopy.Commands;
using Stratrack.Api.Domain.Dukascopy.Events;
using Stratrack.Api.Domain.Dukascopy.Queries;
using Stratrack.Api.Domain.Strategies;
using Stratrack.Api.Domain.Strategies.Commands;
using Stratrack.Api.Domain.Strategies.Events;
using Stratrack.Api.Domain.Strategies.Queries;

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
                typeof(DataChunkRegisterCommand),
                typeof(DataChunkDeleteCommand),
                typeof(DukascopyJobCreateCommand),
                typeof(DukascopyJobStartCommand),
                typeof(DukascopyJobStopCommand),
                typeof(DukascopyJobDeleteCommand)
            ).AddCommandHandlers(
                typeof(StrategyCreateCommandHandler),
                typeof(StrategyUpdateCommandHandler),
                typeof(StrategyDeleteCommandHandler),
                typeof(DataSourceCreateCommandHandler),
                typeof(DataSourceUpdateCommandHandler),
                typeof(DataSourceDeleteCommandHandler),
                typeof(DataChunkRegisterCommandHandler),
                typeof(DataChunkDeleteCommandHandler),
                typeof(DukascopyJobCreateCommandHandler),
                typeof(DukascopyJobStartCommandHandler),
                typeof(DukascopyJobStopCommandHandler),
                typeof(DukascopyJobDeleteCommandHandler)
            ).AddEvents(
                typeof(StrategyCreatedEvent),
                typeof(StrategyUpdatedEvent),
                typeof(StrategyVersionAddedEvent),
                typeof(StrategyDeletedEvent),
                typeof(DataSourceCreatedEvent),
                typeof(DataSourceUpdatedEvent),
                typeof(DataSourceDeletedEvent),
                typeof(DataChunkRegisteredEvent),
                typeof(DataChunkDeletedEvent),
                typeof(DukascopyJobCreatedEvent),
                typeof(DukascopyJobStartedEvent),
                typeof(DukascopyJobStoppedEvent),
                typeof(DukascopyJobDeletedEvent)
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
            ef.AddQueryHandlers(typeof(DataSourceReadModelSearchQueryHandler));
            ef.AddQueryHandlers(typeof(DataChunkReadModelSearchQueryHandler));
            ef.AddQueryHandlers(typeof(DukascopyJobReadModelSearchQueryHandler));
            ef.RegisterServices(s =>
            {
                s.AddSingleton<IBlobStorage, DatabaseBlobStorage>();
                s.AddSingleton<DataChunkReadModelLocator>();
                s.AddSingleton<IDukascopyClient, DukascopyClient>();
                s.AddSingleton<DukascopyFetchService>();
                s.AddSingleton<CsvChunkService>();
            });
        });
    }
}
