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
using Stratrack.Api.Domain.DataSources.Services;
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
                typeof(DataChunkDeleteCommand)
            ).AddCommandHandlers(
                typeof(StrategyCreateCommandHandler),
                typeof(StrategyUpdateCommandHandler),
                typeof(StrategyDeleteCommandHandler),
                typeof(DataSourceCreateCommandHandler),
                typeof(DataSourceUpdateCommandHandler),
                typeof(DataSourceDeleteCommandHandler),
                typeof(DataChunkRegisterCommandHandler),
                typeof(DataChunkDeleteCommandHandler)
            ).AddEvents(
                typeof(StrategyCreatedEvent),
                typeof(StrategyUpdatedEvent),
                typeof(StrategyVersionAddedEvent),
                typeof(StrategyDeletedEvent),
                typeof(DataSourceCreatedEvent),
                typeof(DataSourceUpdatedEvent),
                typeof(DataSourceDeletedEvent),
                typeof(DataChunkRegisteredEvent),
                typeof(DataChunkDeletedEvent)
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
            ef.AddQueryHandlers(typeof(DataSourceReadModelSearchQueryHandler));
            ef.RegisterServices(s =>
            {
                s.AddSingleton<IBlobStorage, DatabaseBlobStorage>();
                s.AddSingleton<IDataChunkStore, InMemoryDataChunkStore>();
                s.AddSingleton<IDataChunkRegistrar, DataChunkRegistrar>();
                s.AddSingleton<IDataChunkRemover, DataChunkRemover>();
            });
        });
    }
}
