@extends ('_master')


@section('head')
    
@stop


@section('controls')
    
@stop


@section('content')
    
    <ul>
        @foreach($errors->all() as $message)
            <li>{{ $message }}</li>
        @endforeach
        
        @if (Session::get('loginError'))
            <li>{{ Session::get('loginError') }}</li>
        @endif
    </ul>
    
    <div class="profile">
    
        <div class="profile-username"> {{ Auth::user()->username; }}</div>
        
        {{ Form::open(array('id' => 'editProfileForm', 'url' => '/edit/profile', 'method' => 'POST')) }}
            
            {{ Form::label('email', 'Email') }}
            <br>
            {{ Form::email('email', Auth::user()->email, array('id' => 'email', 'required')) }}
            
            <br><br>
            
            {{ Form::label('confirmEmail', 'Confirm Email') }}
            <br>
            {{ Form::email('confirmEmail', Auth::user()->email, array('id' => 'confirmEmail', 'required')) }}
            
            <br><br>
            
            {{ Form::label('description', 'Description') }}
            <br>
            {{ Form::textarea('description', Auth::user()->description, array('id' => 'description')) }}
            
            <br><br>
            
            {{ Form::submit('Submit') }}
            
        {{ Form::close() }}
    
    </div>
    
@stop


@section('inputs')
    

@stop


@section('scripts')
    
    <script type="text/javascript" src='{{ asset('scripts/gamestatus.js') }}'></script>

@stop