@extends ('_master')


@section('head')
    
@stop


@section('controls')
    
@stop


@section('content')
    
    <div class="results">
    
        <div class="results-gameInterfaceId">{{ $interfaceId; }}</div>
    
        <table class="resultsTable">
        
            <tr class="headerRow">
            
                <th></th>
                <th>kills</th>
                <th>assists</th>
                <th>deaths</th>
                <th></th>
                    
            </tr>
            
            <tr class="colorRow">
                <td colspan="5"></td>
            </tr>
        
        @foreach ($users as $user)
            
            @if ($user->pivot->victory)
                <tr class="winner">
            @else
                <tr>
            @endif
            
                <td class="userCell">{{ $user->username; }}</td>
                <td>{{ $user->pivot->kills; }}</td>
                <td>{{ $user->pivot->assists; }}</td>
                <td>{{ $user->pivot->deaths; }}</td>
            
                @if ($user->pivot->victory)
                    <td class="victorText">victor</td>
                @else
                    <td></td>
                @endif
                    
            </tr>
                
            <tr class="colorRow">
                <td colspan="5"></td>
            </tr>
        
        @endforeach
        </table>

    </div>
    
@stop


@section('inputs')
    

@stop


@section('scripts')

    <script type="text/javascript" src='{{ asset('scripts/gamestatus.js') }}'></script>

@stop