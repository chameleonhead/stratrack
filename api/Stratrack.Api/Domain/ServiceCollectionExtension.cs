using EventFlow.EntityFramework;
using EventFlow.EntityFramework.Extensions;
using EventFlow.Extensions;
using Microsoft.Extensions.DependencyInjection;
using Stratrack.Api.Domain.Strategies;
using Stratrack.Api.Domain.Strategies.Commands;
using Stratrack.Api.Domain.Strategies.Events;
using Stratrack.Api.Domain.Strategies.Queries;

namespace Stratrack.Api.Domain;

public static class ServiceCollectionExtension
{
    public static IServiceCollection AddStratrack<TDbContextProvider>(this IServiceCollection services)
        where TDbContextProvider: class, IDbContextProvider<StratrackDbContext>
    {
        return services.AddEventFlow(ef =>
        {
            ef.AddCommands(typeof(StrategyCreateCommand), typeof(StrategyUpdateCommand))
                .AddCommandHandlers(typeof(StrategyCreateCommandHandler), typeof(StrategyUpdateCommandHandler))
                .AddEvents(typeof(StrategyCreatedEvent), typeof(StrategyUpdatedEvent), typeof(StrategyVersionAddedEvent));

            ef.ConfigureEntityFramework(EntityFrameworkConfiguration.New);
            ef.AddDbContextProvider<StratrackDbContext, TDbContextProvider>();
            ef.UseEntityFrameworkEventStore<StratrackDbContext>();
            ef.UseEntityFrameworkReadModel<StrategyReadModel, StratrackDbContext>();
            ef.RegisterServices(services => services.AddSingleton<StrategyVersionReadModelLocator>());
            ef.UseEntityFrameworkReadModel<StrategyVersionReadModel, StratrackDbContext, StrategyVersionReadModelLocator>();
            ef.AddQueryHandlers(typeof(StrategyReadModelSearchQueryHandler));
            ef.AddQueryHandlers(typeof(StrategyVersionReadModelSearchQueryHandler));
        });
    }
}
