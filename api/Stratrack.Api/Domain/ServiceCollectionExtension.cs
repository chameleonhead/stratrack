using EventFlow.Extensions;
using EventFlow.MsSql;
using EventFlow.MsSql.Extensions;
using Microsoft.Extensions.DependencyInjection;
using Stratrack.Api.Domain.Strategies;
using Stratrack.Api.Domain.Strategies.Commands;
using Stratrack.Api.Domain.Strategies.Events;
using Stratrack.Api.Domain.Strategies.Queries;

namespace Stratrack.Api.Domain;

public static class ServiceCollectionExtension
{
    public static IServiceCollection AddStratrack(this IServiceCollection services)
    {
        return services.AddEventFlow(ef =>
        {
            ef.AddCommands(typeof(StrategyCreateCommand), typeof(StrategyUpdateCommand))
                .AddCommandHandlers(typeof(StrategyCreateCommandHandler), typeof(StrategyUpdateCommandHandler))
                .AddEvents(typeof(StrategyCreatedEvent), typeof(StrategyUpdatedEvent), typeof(StrategyVersionAddedEvent));

            var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings:StratrackDb");
            if (string.IsNullOrEmpty(connectionString))
            {
                ef.UseInMemoryReadStoreFor<StrategyReadModel>();
                ef.RegisterServices(services => services.AddSingleton<StrategyVersionReadModelLocator>());
                ef.UseInMemoryReadStoreFor<StrategyVersionReadModel, StrategyVersionReadModelLocator>();
                ef.AddQueryHandlers(typeof(InMemoryStrategyReadModelSearchQueryHandler));
                ef.AddQueryHandlers(typeof(InMemoryStrategyVersionReadModelSearchQueryHandler));
            }
            else
            {
                ef.ConfigureMsSql(MsSqlConfiguration.New.SetConnectionString(connectionString));
                ef.UseMssqlEventStore();
                ef.UseMssqlReadModel<StrategyReadModel>();
                ef.RegisterServices(services => services.AddSingleton<StrategyVersionReadModelLocator>());
                ef.UseMssqlReadModel<StrategyVersionReadModel, StrategyVersionReadModelLocator>();
                ef.AddQueryHandlers(typeof(MssqlStrategyReadModelSearchQueryHandler));
                ef.AddQueryHandlers(typeof(MssqlStrategyVersionReadModelSearchQueryHandler));
            }
        });
    }
}
