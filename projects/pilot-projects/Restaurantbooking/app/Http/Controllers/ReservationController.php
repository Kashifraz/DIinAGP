<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Reservation;
use App\Models\Table;
use Illuminate\Support\Facades\Auth;
use App\Mail\ReservationConfirmationMail;
use App\Mail\ReservationUpdateMail;
use Illuminate\Support\Facades\Mail;

class ReservationController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $user = Auth::user();
        if (in_array($user->role, ['admin', 'staff'])) {
            $reservations = Reservation::with('table', 'user')->orderBy('time_slot', 'desc')->get();
        } else {
            $reservations = Reservation::with('table', 'user')->where('user_id', $user->id)->orderBy('time_slot', 'desc')->get();
        }
        return view('reservations.index', compact('reservations'));
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        $tables = Table::where('status', 'available')->get();
        return view('reservations.create', compact('tables'));
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'table_id' => 'required|exists:tables,id',
            'time_slot' => 'required|date',
            'guests' => 'required|integer|min:1',
            'special_requests' => 'nullable|string',
        ]);
        // Check for double booking
        $exists = Reservation::where('table_id', $validated['table_id'])
            ->where('time_slot', $validated['time_slot'])
            ->exists();
        if ($exists) {
            return back()->withErrors(['time_slot' => 'This table is already booked for the selected time slot.'])->withInput();
        }
        $validated['user_id'] = Auth::id();
        $validated['status'] = 'pending';
        $reservation = Reservation::create($validated);
        // Send confirmation email
        $reservation->load('user', 'table');
        Mail::to($reservation->user->email)->send(new ReservationConfirmationMail($reservation));
        return redirect()->route('reservations.index')->with('success', 'Reservation created successfully.');
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $reservation = Reservation::with('table', 'user')->findOrFail($id);
        $user = Auth::user();
        if (in_array($user->role, ['admin', 'staff']) || $reservation->user_id == $user->id) {
            return view('reservations.show', compact('reservation'));
        }
        abort(403, 'Unauthorized.');
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        $reservation = Reservation::findOrFail($id);
        $user = Auth::user();
        if (in_array($user->role, ['admin', 'staff']) || $reservation->user_id == $user->id) {
            $tables = Table::where('status', 'available')->orWhere('id', $reservation->table_id)->get();
            return view('reservations.edit', compact('reservation', 'tables'));
        }
        abort(403, 'Unauthorized.');
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $reservation = Reservation::findOrFail($id);
        $user = Auth::user();
        if (!in_array($user->role, ['admin', 'staff']) && $reservation->user_id != $user->id) {
            abort(403, 'Unauthorized.');
        }
        $validated = $request->validate([
            'table_id' => 'required|exists:tables,id',
            'time_slot' => 'required|date',
            'guests' => 'required|integer|min:1',
            'special_requests' => 'nullable|string',
            'status' => 'required|string',
        ]);
        // Check for double booking (ignore current reservation)
        $exists = Reservation::where('table_id', $validated['table_id'])
            ->where('time_slot', $validated['time_slot'])
            ->where('id', '!=', $reservation->id)
            ->exists();
        if ($exists) {
            return back()->withErrors(['time_slot' => 'This table is already booked for the selected time slot.'])->withInput();
        }
        $reservation->update($validated);
        // Send update email
        $reservation->load('user', 'table');
        Mail::to($reservation->user->email)->send(new ReservationUpdateMail($reservation));
        return redirect()->route('reservations.index')->with('success', 'Reservation updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $reservation = Reservation::findOrFail($id);
        $user = Auth::user();
        if (!in_array($user->role, ['admin', 'staff']) && $reservation->user_id != $user->id) {
            abort(403, 'Unauthorized.');
        }
        $reservation->delete();
        return redirect()->route('reservations.index')->with('success', 'Reservation deleted successfully.');
    }
}
