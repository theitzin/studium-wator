import matplotlib
import matplotlib.pyplot as plt
import numpy as np

def fish(t):
    return 80*np.sin(t / 30) + 90

def shark(t):
    return 40*np.sin(t / 30 - 1) + 45

t = np.arange(0.0, 500.0, 1)

font = {'family' : 'normal',
        'size'   : 7}
matplotlib.rc('font', **font)

plot_fish, = plt.plot(t, fish(t), label='Fische', color='#319A9C', linewidth=1.0)
plot_shark, = plt.plot(t, shark(t), label='Haie', color='#969D9D', linewidth=1.0)
plt.legend(handles=[plot_fish, plot_shark], loc=1)
#plt.ylabel('Populationen')
#plt.xlabel('Zeit (Chronen)')
plt.axes().set_xlim([t[0], t[-1]])
xlim = plt.axes().get_xlim()
ylim = plt.axes().get_ylim()
ratio = (ylim[1] - ylim[0]) / (xlim[1] - xlim[0])
plt.axes().set_aspect(0.25 / ratio)

plt.savefig('lotka_volterra.png', transparent=True, bbox_inches='tight', format='png', dpi=200)
plt.show()