@extends ('_master')


@section('head')
    
@stop


@section('controls')
    
    @if (Auth::user()->username == $user->username)
        {{ Form::open(array('id' => 'editProfileForm', 'url' => '/edit/profile', 'method' => 'GET')) }}
        
            {{ Form::submit('Edit Profile') }}
        
        {{ Form::close() }}
    @endif
    
@stop


@section('content')
    
    <div class="profile">
    
        <div class="profile-username"> {{ $user->username; }}</div>
            
        @if ($user->description)
            
            <div class="profile-description"> {{ $user->description; }}</div>
            
        @else
            
            <div class="profile-description">(this user has not written a description yet)</div>
            
        @endif
        
    </div>
    
@stop


@section('inputs')
    

@stop


@section('scripts')
    
    <script type="text/javascript" src='{{ asset('scripts/gamestatus.js') }}'></script>

@stop