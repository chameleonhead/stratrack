namespace Stratrack.Api.Domain.Dukascopy;

public class DukascopyJobControl : IDukascopyJobControl
{
    private volatile bool _isRunning;
    public bool IsRunning => _isRunning;
    public void Start() => _isRunning = true;
    public void Stop() => _isRunning = false;
}
