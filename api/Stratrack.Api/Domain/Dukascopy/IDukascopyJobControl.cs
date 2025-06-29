namespace Stratrack.Api.Domain.Dukascopy;

public interface IDukascopyJobControl
{
    void Start();
    void Stop();
    bool IsRunning { get; }
}
