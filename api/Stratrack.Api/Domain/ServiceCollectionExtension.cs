using EventFlow.EntityFramework;
using EventFlow.EntityFramework.Extensions;
using EventFlow.Extensions;
using Microsoft.Extensions.DependencyInjection;
using Stratrack.Api.Domain.DataSources;
using Stratrack.Api.Domain.DataSources.Commands;
using Stratrack.Api.Domain.DataSources.Events;
using Stratrack.Api.Domain.DataSources.Queries;
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
            ef.AddCommands(typeof(StrategyCreateCommand), typeof(StrategyUpdateCommand), typeof(StrategyDeleteCommand))
                .AddCommandHandlers(typeof(StrategyCreateCommandHandler), typeof(StrategyUpdateCommandHandler), typeof(StrategyDeleteCommandHandler))
                .AddEvents(typeof(StrategyCreatedEvent), typeof(StrategyUpdatedEvent), typeof(StrategyVersionAddedEvent), typeof(StrategyDeletedEvent));
            ef.UseEntityFrameworkEventStore<StratrackDbContext>();
            ef.AddDbContextProvider<StratrackDbContext, TDbContextProvider>();
            ef.ConfigureEntityFramework(EntityFrameworkConfiguration.New);

            ef.UseEntityFrameworkReadModel<StrategyReadModel, StratrackDbContext>();
            ef.RegisterServices(services => services.AddSingleton<StrategyVersionReadModelLocator>());
            ef.UseEntityFrameworkReadModel<StrategyVersionReadModel, StratrackDbContext, StrategyVersionReadModelLocator>();
            ef.AddQueryHandlers(typeof(StrategyReadModelSearchQueryHandler));
            ef.AddQueryHandlers(typeof(StrategyVersionReadModelSearchQueryHandler));

            ef.AddCommands(typeof(DataSourceCreateCommand), typeof(DataSourceUpdateCommand), typeof(DataSourceDeleteCommand))
                .AddCommandHandlers(typeof(DataSourceCreateCommandHandler), typeof(DataSourceUpdateCommandHandler), typeof(DataSourceDeleteCommandHandler))
                .AddEvents(typeof(DataSourceCreatedEvent), typeof(DataSourceUpdatedEvent), typeof(DataSourceDeletedEvent));

            ef.UseEntityFrameworkReadModel<DataSourceReadModel, StratrackDbContext>();
            ef.AddQueryHandlers(typeof(DataSourceReadModelSearchQueryHandler));
        });
    }
}
